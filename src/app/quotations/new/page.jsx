"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { quotationService } from '@/services/quotations';
import { customerService } from '@/services/customers';
import { materialService } from '@/services/materials';
import { laborRateService, bopRateService } from '@/services/rates';
import { useRouter } from 'next/navigation';
import CustomerModal from '@/components/modals/CustomerModal';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import ValidationModal from '@/components/modals/ValidationModal';
import ScopeAndIdentity from '@/components/quotations/ScopeAndIdentity';
import BOMRegistry from '@/components/quotations/BOMRegistry';
import RawMaterial from '@/components/quotations/RawMaterial';
import MachiningLogic from '@/components/quotations/MachiningLogic';
import BroughtOutParts from '@/components/quotations/BroughtOutParts';
import CommercialAdjustments from '@/components/quotations/CommercialAdjustments';
import ValuationLedger from '@/components/quotations/ValuationLedger';

export default function NewQuotationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isDraftConfirmOpen, setIsDraftConfirmOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState({ open: false, message: '' });
  const [missingFields, setMissingFields] = useState([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [formData, setFormData] = useState({
    quotation_no: '', 
    supplier_name: '', 
    customer: null, // Project-wide customer
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    quoting_engineer: '',
    revision_no: 'Rev 00',
    inquiry_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    status: 'Draft',
    markup: 15,
    packaging_cost: 0,
    transportation_cost: 0,
    design_cost: 0,
    assembly_cost: 0,
    production_mode: 'Batch',
    quantity: 1,
    project_image: null,
    items: [
      {
        id: Date.now(),
        part_name: 'Part 01',
        qty: 1,
        material: null,
        material_weight: 0,
        wastage: 3,
        hardness: '',
        tolerance: '',
        surface_finish: '',
        treatments: [],
        inspection: { cmm: false, mtc: false, cmm_cost: 0, mtc_cost: 0 },
        processes: [],
        bought_out_items: [],
        design_files: [],
        part_image: null
      }
    ] 
  });

  // Master Data for Selects
  const [libraries, setLibraries] = useState({
    customers: [],
    materials: [],
    labor: [],
    bop: []
  });

  const [activePhase, setActivePhase] = useState('scope'); // scope, material, machining

  const [customerSearch, setCustomerSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Persistence Layer: Load Draft
  useEffect(() => {
    setMounted(true);
    const savedFormData = localStorage.getItem('draft_formData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, []);

  // Persistence Layer: Save changes
  useEffect(() => {
     if (!isLoading) {
        localStorage.setItem('draft_formData', JSON.stringify({
           ...formData,
            items: formData.items.map(item => ({ 
               ...item, 
               design_files: (item.design_files || []).filter(f => f.$id), // Only persist uploaded assets
               part_image: item.part_image?.$id ? item.part_image : null
            })) 
         }));
     }
  }, [formData, isLoading]);

  // Derived Active Item
  const activeQuote = formData.items[selectedItemIndex] || formData.items[0] || {
    id: Date.now(),
    part_name: 'Part 01',
    qty: 1,
    material: null,
    material_weight: 0,
    wastage: 3,
    hardness: '',
    tolerance: '',
    surface_finish: '',
    treatments: [], // Dynamic array for HT, ST, etc.
    inspection: { cmm: false, mtc: false, cmm_cost: 0, mtc_cost: 0 },
    processes: [],
    bought_out_items: [],
    design_files: [],
    part_image: null
  };

  const setActiveQuote = (update) => {
     setFormData(prev => {
        const newItems = [...prev.items];
        const currentItem = newItems[selectedItemIndex];
        const updatedItem = typeof update === 'function' ? update(currentItem) : update;
        newItems[selectedItemIndex] = { ...currentItem, ...updatedItem };
        return { ...prev, items: newItems };
     });
  };

  useEffect(() => {
    // Generate sequential ID only if not restored from draft
    const initSequence = async () => {
      const savedFormData = localStorage.getItem('draft_formData');
      if (savedFormData) {
         const parsed = JSON.parse(savedFormData);
         if (parsed.quotation_no) return; // Already have an ID
      }
      try {
        const nextId = await quotationService.generateNextQuotationID();
        setFormData(prev => ({ ...prev, quotation_no: nextId }));
      } catch (err) {
        console.error("ID Generation failed:", err);
      }
    };
    initSequence();

    const fetchMasterData = async () => {
      try {
        setIsLoading(true);
        const [c, m, l, b] = await Promise.all([
          customerService.listCustomers(100),
          materialService.listMaterials(100),
          laborRateService.listRates(100),
          bopRateService.listRates(100)
        ]);
        setLibraries({
          customers: c.documents,
          materials: m.documents,
          labor: l.documents,
          bop: b.documents
        });
      } catch (err) {
        console.error("Master data fetch failed:", err);
        setErrorDetails({ open: true, message: "Network instability detected. Master data failed to load." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchMasterData();
  }, []);

  // Server-side Customer Search (handles large datasets)
  useEffect(() => {
    if (!mounted) return;
    
    const delayDebounceFn = setTimeout(async () => {
      if (customerSearch.trim().length >= 2) {
        try {
          const res = await customerService.listCustomers(50, 0, customerSearch);
          setLibraries(prev => ({ ...prev, customers: res.documents }));
        } catch (err) {
          console.error("Search failed:", err);
        }
      } else if (customerSearch.trim().length === 0) {
        // Restore initial list
        const res = await customerService.listCustomers(100);
        setLibraries(prev => ({ ...prev, customers: res.documents }));
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [customerSearch, mounted]);

  // Calculation Logic (Consolidated Ledger)
  if (!mounted) {
     return (
        <DashboardLayout title="Create Your Quotation">
           <div className="flex h-64 items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 animate-pulse">Setting up your workspace...</span>
           </div>
        </DashboardLayout>
     );
  }

  const calculateTotals = () => {
    let materialTotal = 0;
    let laborTotal = 0;
    let bopTotal = 0;
    let treatmentTotal = 0;

    let projectEngineeringTotal = parseFloat(formData.design_cost || 0) + parseFloat(formData.assembly_cost || 0); 

    formData.items.forEach(item => {
      const quantity = parseFloat(item.qty || 1);
      
      // Material Component (per unit * quantity)
      if (item.material && item.material_weight > 0) {
          materialTotal += (item.material_weight * item.material.base_rate) * quantity;
      }

      // Labor Component (Total Batch Cost = (Setup Time + (Cycle Time * Quantity)) * Rate / 60)
      laborTotal += item.processes.reduce((acc, p) => {
          const rate = parseFloat(p.rate || p.hourly_rate || 0);
          const unit = p.unit || 'hr';
          if (unit === 'hr') {
            const totalMinutes = parseFloat(p.setup_time || 0) + (parseFloat(p.cycle_time || 0) * quantity);
            return acc + (rate * (totalMinutes / 60));
          }
          // Non-hourly: qty * val_per_part * rate
          return acc + (quantity * parseFloat(p.cycle_time || 0) * rate);
      }, 0);



      // External Treatments (Batch-level costs)
      treatmentTotal += (item.treatments || []).reduce((acc, t) => acc + (parseFloat(t.cost || 0) * (t.per_unit !== false ? quantity : 1)), 0);



      // Design and Assembly are now handled project-wide outside the items loop

      // 3. Brought Out Parts (BOP)
      bopTotal += (item.bought_out_items || []).reduce((acc, b) => acc + (parseFloat(b.rate || 0) * (b.qty || 1) * quantity), 0);
    });
    
    // 3. Project Level Adjustments
    const commercialTotal = parseFloat(formData.packaging_cost || 0) + parseFloat(formData.transportation_cost || 0);

    const subtotal = materialTotal + laborTotal + bopTotal + treatmentTotal + projectEngineeringTotal + commercialTotal;
    const finalTotal = subtotal * (1 + (formData.markup / 100));
    
    return { 
      subtotal, 
      finalTotal, 
      materialCost: materialTotal, 
      laborCost: laborTotal, 
      bopCost: bopTotal, 
      treatmentCost: treatmentTotal, 

      engineeringCost: projectEngineeringTotal,
      commercialCost: commercialTotal
    };
  };

  const totals = calculateTotals();


  const handleSave = async (e) => {
      if (e) e.preventDefault();
      // Validation Logic
      const missingFields = [];
      if (!formData.customer && !formData.supplier_name) missingFields.push("Organization / Customer");
     if (!formData.contact_person) missingFields.push("Contact Person Name");
     if (!formData.contact_phone) missingFields.push("Contact Number");
     if (!formData.quoting_engineer) missingFields.push("Estimating Staff");
     if (!formData.revision_no) missingFields.push("Quotation Version");
     if (!formData.inquiry_date) missingFields.push("Date Received");
     if (!formData.delivery_date) missingFields.push("Expected Delivery Date");
     if (!formData.quantity || formData.quantity <= 0) missingFields.push("Quantity to Make (Total)");
     if (!formData.project_image) missingFields.push("Project Model / Snapshot Image");

      if (formData.items.length === 0) {
         missingFields.push("At least one BOM item");
      } else {
         formData.items.forEach((item, idx) => {
            const partNum = idx + 1;
            const pName = item.part_name || `Part ${partNum}`;

            if (!item.part_name) missingFields.push(`${pName}: Component Name`);
            if (!item.qty || item.qty <= 0) missingFields.push(`${pName}: Manufacturing Qty`);
            
            // Raw Material Validation
            if (!item.material) {
               missingFields.push(`${pName}: Material Selection`);
            } else if (!item.material.base_rate || item.material.base_rate <= 0) {
               missingFields.push(`${pName}: Material Base Rate`);
            }

            if (!item.shape) {
               missingFields.push(`${pName}: Raw Material Profile/Shape`);
            } else {
               // Dimension Validation based on shape
               const d = item.dimensions || {};
               if (!d.l || parseFloat(d.l) <= 0) missingFields.push(`${pName}: Length (L)`);
               
               if (item.shape === 'rect') {
                  if (!d.w || parseFloat(d.w) <= 0) missingFields.push(`${pName}: Width (W)`);
                  if (!d.t || parseFloat(d.t) <= 0) missingFields.push(`${pName}: Thickness (T)`);
               } else if (item.shape === 'round') {
                  if (!d.dia || parseFloat(d.dia) <= 0) missingFields.push(`${pName}: Diameter (Dia)`);
               } else if (item.shape === 'hex') {
                  if (!d.af || parseFloat(d.af) <= 0) missingFields.push(`${pName}: Across Flat (AF)`);
               }
            }

            // Machining Validation
            if (item.processes && item.processes.length > 0) {
               item.processes.forEach((proc, pIdx) => {
                  if (!proc.process_name) missingFields.push(`${pName}: Machining Operation ${pIdx + 1} Type`);
                  const rate = proc.rate; // Use the new 'rate' field
                  if (!rate || rate <= 0) missingFields.push(`${pName}: Machining Operation ${pIdx + 1} Machine Rate`);
               });
            }

            // BOP Validation
            if (item.bought_out_items && item.bought_out_items.length > 0) {
               item.bought_out_items.forEach((bop, bIdx) => {
                  const bName = bop.item_name === 'CUSTOM' ? 'Custom Item' : (bop.item_name || `BOP ${bIdx + 1}`);
                  if (!bop.item_name) missingFields.push(`${pName}: Bought Out Material Descriptor (BOP ${bIdx + 1})`);
                  if (!bop.qty || bop.qty <= 0) missingFields.push(`${pName}: BOP "${bName}" Volume/Quantity`);
                  if (!bop.rate || bop.rate <= 0) missingFields.push(`${pName}: BOP "${bName}" Procurement Rate`);
               });
            }
         });
      }

      if (missingFields.length > 0) {
         setMissingFields(missingFields);
         setIsValidationOpen(true);
         return;
      }

      setIsSaveConfirmOpen(true);
   };

   const commitSave = async () => {
      try {
         // Destructure only valid schema fields from formData
         const { 
            quotation_no, supplier_name, contact_person, contact_phone, 
            contact_email, quoting_engineer, revision_no, inquiry_date, 
            delivery_date, status, markup, packaging_cost, 
            transportation_cost, design_cost, assembly_cost,
            production_mode, quantity 
         } = formData;

         const payload = {
            quotation_no,
            supplier_name: formData.customer?.name || supplier_name || 'Unknown',
            contact_person,
            contact_phone,
            contact_email,
            quoting_engineer,
            revision_no,
            inquiry_date,
            delivery_date,
            status: 'Completed',
            markup,
            packaging_cost,
            transportation_cost,
            design_cost,
            assembly_cost,
            production_mode,
            quantity: parseInt(quantity) || 1,
            project_image: formData.project_image ? JSON.stringify(formData.project_image) : '',
            // Required part_number for schema compatibility, mapping to first item
            part_number: formData.items[0]?.part_name || 'MULTIPLE',
            items: JSON.stringify(formData.items.map(i => ({ 
               ...i, 
               design_files: (i.design_files || []).filter(f => f.$id), // Persist only uploaded assets
               part_image: i.part_image?.$id ? i.part_image : null
            }))),
            detailed_breakdown: JSON.stringify(totals),
            total_amount: totals.finalTotal,
            subtotal: totals.subtotal,
            customer_id: formData.customer?.$id || ''
         };

         await quotationService.createQuotation(payload);
         localStorage.removeItem('draft_formData');
         router.push('/quotations');
      } catch (e) {
         console.error("Save Error:", e);
         setErrorDetails({ open: true, message: e.message || "Unknown persistence error" });
      } finally {
         setIsSaveConfirmOpen(false);
      }
   };

   const handleSaveDraft = () => {
      // Minimal validation for draft
      if (!formData.quotation_no) {
         setErrorDetails({ open: true, message: "A Quotation Reference ID is required to save a draft." });
         return;
      }
      setIsDraftConfirmOpen(true);
   };

   const commitDraft = async () => {
      try {
         const { 
            quotation_no, supplier_name, contact_person, contact_phone, 
            contact_email, quoting_engineer, revision_no, inquiry_date, 
            delivery_date, markup, packaging_cost, 
            transportation_cost, design_cost, assembly_cost,
            production_mode, quantity 
         } = formData;

         const payload = {
            quotation_no,
            supplier_name: formData.customer?.name || supplier_name || 'Anonymous Draft',
            contact_person,
            contact_phone,
            contact_email,
            quoting_engineer,
            revision_no,
            inquiry_date,
            delivery_date,
            status: 'Draft',
            markup,
            packaging_cost,
            transportation_cost,
            design_cost,
            assembly_cost,
            production_mode,
            quantity: parseInt(quantity) || 1,
            part_number: formData.items[0]?.part_name || 'DRAFT',
            items: JSON.stringify(formData.items.map(i => ({ 
               ...i, 
               design_files: (i.design_files || []).filter(f => f.$id),
               part_image: i.part_image?.$id ? i.part_image : null
            }))),
            detailed_breakdown: JSON.stringify(totals),
            total_amount: totals.finalTotal,
            subtotal: totals.subtotal,
            customer_id: formData.customer?.$id || ''
         };

         await quotationService.createQuotation(payload);
         localStorage.removeItem('draft_formData');
         router.push('/quotations');
      } catch (e) {
         console.error("Draft Save Error:", e);
         setErrorDetails({ open: true, message: e.message || "Failed to commit draft to registry." });
      } finally {
         setIsDraftConfirmOpen(false);
      }
   };

  const handleDiscard = (e) => {
     if (e) e.preventDefault();
     setIsDiscardConfirmOpen(true);
  };

  const confirmDiscard = () => {
     localStorage.removeItem('draft_formData');
     router.push('/quotations');
  };

  return (
    <DashboardLayout 
      title="Create Your Quotation"
      primaryAction={
        <div className="flex gap-4 items-center relative z-[999]">
            <button 
              type="button"
              onClick={handleDiscard}
              className="px-4 h-10 flex items-center justify-center text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer pointer-events-auto"
            >
              Cancel
            </button>
            <div className="h-6 w-px bg-zinc-200" />
            <button 
              type="button"
              onClick={handleSaveDraft}
              className="px-6 h-10 flex items-center justify-center text-[11px] font-extrabold uppercase tracking-widest text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer pointer-events-auto"
            >
              Save Draft
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="px-8 h-10 flex items-center justify-center rounded-xl bg-brand-primary text-zinc-950 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/25 hover:scale-[1.02] transition-all active:scale-95 border border-brand-primary/20 cursor-pointer pointer-events-auto"
            >
              Save & Finish
            </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
         {/* Left: Engineering Ledger */}
         <div className="xl:col-span-3 space-y-3">
            <ScopeAndIdentity 
               formData={formData}
               setFormData={setFormData}
               activeQuote={activeQuote}
               setActiveQuote={setActiveQuote}
               libraries={libraries}
               activePhase={activePhase}
               setActivePhase={setActivePhase}
               setIsQuickAddOpen={setIsQuickAddOpen}
               customerSearch={customerSearch}
               setCustomerSearch={setCustomerSearch}
               isDropdownOpen={isDropdownOpen}
               setIsDropdownOpen={setIsDropdownOpen}
               panelIndex={1}
            />

            <BOMRegistry 
               formData={formData}
               setFormData={setFormData}
               activePhase={activePhase}
               setActivePhase={setActivePhase}
               panelIndex={2}
               onError={(msg) => setErrorDetails({ open: true, message: msg })}
            />

            <RawMaterial 
               activePhase={activePhase}
               setActivePhase={setActivePhase}
               formData={formData}
               setFormData={setFormData}
               libraries={libraries}
               panelIndex={3}
            />

            <MachiningLogic 
               activePhase={activePhase}
               setActivePhase={setActivePhase}
               formData={formData}
               setFormData={setFormData}
               libraries={libraries}
               panelIndex={4}
            />

            <BroughtOutParts
               activePhase={activePhase}
               setActivePhase={setActivePhase}
               formData={formData}
               setFormData={setFormData}
               libraries={libraries}
               panelIndex={5}
            />

             <CommercialAdjustments 
                activePhase={activePhase}
                setActivePhase={setActivePhase}
                formData={formData}
                setFormData={setFormData}
                panelIndex={6}
             />
         </div>

         {/* Right: Valuation Sidebar */}
         <div className="xl:col-span-1">
            <ValuationLedger 
               totals={totals}
               activeQuote={activeQuote}
               setActiveQuote={setActiveQuote}
               formData={formData}
               setFormData={setFormData}
               activePhase={activePhase}
            />
         </div>
      </div>

     {isQuickAddOpen && (
        <CustomerModal 
           onClose={() => setIsQuickAddOpen(false)} 
           onSuccess={(newCustomer) => {
              setLibraries(prev => ({
                 ...prev,
                 customers: [newCustomer, ...prev.customers]
              }));
              setActiveQuote(prev => ({ ...prev, customer: newCustomer }));
              setFormData(prev => ({ 
                 ...prev, 
                 supplier_name: newCustomer.name,
                 contact_person: newCustomer.contact_person || prev.contact_person,
                 contact_phone: newCustomer.phone || prev.contact_phone,
                 contact_email: newCustomer.email || prev.contact_email
              }));
              setCustomerSearch(newCustomer.name);
              setIsQuickAddOpen(false);
           }} 
        />
     )}

     <ConfirmationModal 
        isOpen={isDiscardConfirmOpen}
        onClose={() => setIsDiscardConfirmOpen(false)}
        onConfirm={confirmDiscard}
        title="Abandon Valuation?"
        message="Restore will not be possible. Unsaved data will be purged."
        confirmText="ABANDON"
        cancelText="KEEP EDITING"
        type="danger"
     />

     <ConfirmationModal 
        isOpen={isDraftConfirmOpen}
        onClose={() => setIsDraftConfirmOpen(false)}
        onConfirm={commitDraft}
        title="Save as Draft?"
        message="This will persist your current progress to the registry as an incomplete valuation."
        confirmText="SAVE DRAFT"
        cancelText="KEEP EDITING"
        type="warning"
     />

     <ConfirmationModal 
        isOpen={isSaveConfirmOpen}
        onClose={() => setIsSaveConfirmOpen(false)}
        onConfirm={commitSave}
        title="Commit Valuation?"
        message="Finalize and save this quotation to the master registry."
        confirmText="FINISH & SAVE"
        cancelText="REVIEW DATA"
        type="brand"
     />

     <ValidationModal 
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
        missingFields={missingFields}
     />

     <ConfirmationModal 
        isOpen={errorDetails.open}
        onClose={() => setErrorDetails({ open: false, message: '' })}
        onConfirm={() => setErrorDetails({ open: false, message: '' })}
        title="VALUATION ERROR"
        message={errorDetails.message}
        confirmText="CLOSE"
        type="danger"
     />
    </DashboardLayout>
  );
}
