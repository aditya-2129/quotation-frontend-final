"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { quotationService } from '@/services/quotations';
import { customerService } from '@/services/customers';
import { materialService } from '@/services/materials';
import { laborRateService, bopRateService } from '@/services/rates';
import CustomerModal from '@/components/modals/CustomerModal';
import ScopeAndIdentity from '@/components/quotations/ScopeAndIdentity';
import BOMRegistry from '@/components/quotations/BOMRegistry';
import RawMaterial from '@/components/quotations/RawMaterial';
import MachiningLogic from '@/components/quotations/MachiningLogic';
import BroughtOutParts from '@/components/quotations/BoughtOutParts';
import TechnicalSpecifications from '@/components/quotations/TechnicalSpecifications';
import CommercialAdjustments from '@/components/quotations/CommercialAdjustments';
import ValuationLedger from '@/components/quotations/ValuationLedger';

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [activePhase, setActivePhase] = useState('scope');
  const [customerSearch, setCustomerSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    quotation_no: '', 
    supplier_name: '', 
    customer: null,
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
    items: [] 
  });

  const [libraries, setLibraries] = useState({
    customers: [],
    materials: [],
    labor: [],
    bop: []
  });

  useEffect(() => {
    setMounted(true);
    
    const initializePage = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch Master Data
        const [c, m, l, b] = await Promise.all([
          customerService.listCustomers(100),
          materialService.listMaterials(100),
          laborRateService.listRates(100),
          bopRateService.listRates(100)
        ]);
        
        const libs = {
          customers: c.documents,
          materials: m.documents,
          labor: l.documents,
          bop: b.documents
        };
        setLibraries(libs);

        // 2. Fetch Existing Quotation
        const quote = await quotationService.getQuotation(id);
        
        // 3. Map result to formData
        let parsedItems = [];
        try {
           parsedItems = JSON.parse(quote.items || '[]');
        } catch (e) {
           console.error("Failed to parse items:", e);
        }

        const sanitizedItems = (parsedItems.length > 0 ? parsedItems : [{
           id: 1,
           part_name: 'Part 01',
           qty: 1,
           material: null,
           material_weight: 0,
           wastage: 3,
           inspection: { cmm: false, mtc: false, cmm_cost: 0, mtc_cost: 0 },
           processes: [],
           treatments: [],
           bought_out_items: [],
           design_files: []
        }]).map(item => ({
           ...item,
           processes: item.processes || [],
           treatments: item.treatments || [],
           bought_out_items: item.bought_out_items || [],
           design_files: item.design_files || [],
           inspection: item.inspection || { cmm: false, mtc: false, cmm_cost: 0, mtc_cost: 0 }
        }));
        
        const mappedCustomer = libs.customers.find(cust => cust.$id === quote.customer_id) || null;

        setFormData({
          quotation_no: quote.quotation_no || '',
          supplier_name: quote.supplier_name || '',
          customer: mappedCustomer,
          contact_person: quote.contact_person || '',
          contact_phone: quote.contact_phone || '',
          contact_email: quote.contact_email || '',
          quoting_engineer: quote.quoting_engineer || '',
          revision_no: quote.revision_no || 'Rev 00',
          inquiry_date: quote.inquiry_date || '',
          delivery_date: quote.delivery_date || '',
          status: quote.status || 'Draft',
          markup: quote.markup || 15,
          packaging_cost: quote.packaging_cost || 0,
          transportation_cost: quote.transportation_cost || 0,
          design_cost: quote.design_cost || 0,
          assembly_cost: quote.assembly_cost || 0,
          production_mode: quote.production_mode || 'Batch',
          quantity: quote.quantity || 1,
          items: sanitizedItems
        });

        if (mappedCustomer) {
           setCustomerSearch(mappedCustomer.name);
        }

      } catch (err) {
        console.error("Initialization failed:", err);
        alert("Failed to load valuation data. Verify connection.");
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [id]);

  // Derived Active Item
  const activeQuote = formData.items[selectedItemIndex] || formData.items[0] || {
    id: 1,
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
    design_files: []
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

  const calculateTotals = () => {
    let materialTotal = 0;
    let laborTotal = 0;
    let bopTotal = 0;
    let treatmentTotal = 0;

    let projectEngineeringTotal = parseFloat(formData.design_cost || 0) + parseFloat(formData.assembly_cost || 0); 

    formData.items.forEach(item => {
      const quantity = parseFloat(item.qty || 1);
      
      if (item.material && item.material_weight > 0) {
          materialTotal += (item.material_weight * (item.material.base_rate || 0)) * quantity;
      }

      laborTotal += (item.processes || []).reduce((acc, p) => {
          const totalMinutes = parseFloat(p.setup_time || 0) + (parseFloat(p.cycle_time || 0) * quantity);
          const hours = totalMinutes / 60;
          return acc + (parseFloat(p.hourly_rate || 0) * hours);
      }, 0);



      treatmentTotal += (item.treatments || []).reduce((acc, t) => acc + (parseFloat(t.cost || 0) * (t.per_unit !== false ? quantity : 1)), 0);



      bopTotal += (item.bought_out_items || []).reduce((acc, b) => acc + (parseFloat(b.rate || 0) * (b.qty || 1) * quantity), 0);
    });
    
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

  const handleUpdate = async () => {
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
                if (!proc.hourly_rate || proc.hourly_rate <= 0) missingFields.push(`${pName}: Machining Operation ${pIdx + 1} Machine Rate`);
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
       alert("PLEASE COMPLETE THESE SECTIONS:\n\n" + missingFields.map(f => `• ${f}`).join("\n"));
       return;
    }

    try {
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
          status,
          markup,
          packaging_cost,
          transportation_cost,
          design_cost,
          assembly_cost,
          production_mode,
          quantity: parseInt(quantity) || 1,
          part_number: formData.items[0]?.part_name || 'MULTIPLE',
          items: JSON.stringify(formData.items.map(i => ({ 
             ...i, 
             design_files: (i.design_files || []).filter(f => f.$id) // Persist only uploaded assets
          }))),
          detailed_breakdown: JSON.stringify(totals),
          total_amount: totals.finalTotal,
          subtotal: totals.subtotal,
          customer_id: formData.customer?.$id || ''
       };

       await quotationService.updateQuotation(id, payload);
       router.push('/quotations');
    } catch (e) {
       console.error("Update Error:", e);
       alert("Update failed: " + (e.message || "Unknown error"));
    }
  };

  const handleCancel = () => {
     if (window.confirm("Discard unsaved changes?")) {
        router.push('/quotations');
     }
  };

  if (!mounted || isLoading) {
     return (
        <DashboardLayout title="Edit Quotation">
           <div className="flex h-64 items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 animate-pulse">Loading data...</span>
           </div>
        </DashboardLayout>
     );
  }

  return (
    <DashboardLayout 
      title={`Edit Quotation: ${formData.quotation_no}`}
      primaryAction={
        <div className="flex gap-3">
           <button 
             onClick={handleCancel}
             className="px-5 h-9 flex items-center justify-center text-[11px] font-black uppercase tracking-tight text-zinc-500 hover:text-zinc-950 transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={handleUpdate}
             className="px-6 h-9 flex items-center justify-center rounded-xl bg-zinc-950 text-white text-[11px] font-black uppercase tracking-tight shadow-xl shadow-zinc-950/20 hover:bg-zinc-900 transition-all active:scale-95 border border-zinc-800"
           >
             Save Changes
           </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
         <div className="xl:col-span-3 space-y-4">
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

             <TechnicalSpecifications 
                activePhase={activePhase}
                setActivePhase={setActivePhase}
                formData={formData}
                setFormData={setFormData}
                panelIndex={5}
             />

            <BroughtOutParts
               activePhase={activePhase}
               setActivePhase={setActivePhase}
               formData={formData}
               setFormData={setFormData}
               libraries={libraries}
               panelIndex={6}
            />

             <CommercialAdjustments 
                activePhase={activePhase}
                setActivePhase={setActivePhase}
                formData={formData}
                setFormData={setFormData}
                panelIndex={7}
             />
         </div>

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
                  customer: newCustomer,
                  contact_person: newCustomer.contact_person || prev.contact_person,
                  contact_phone: newCustomer.phone || prev.contact_phone,
                  contact_email: newCustomer.email || prev.contact_email
               }));
               setCustomerSearch(newCustomer.name);
               setIsQuickAddOpen(false);
            }} 
         />
      )}
    </DashboardLayout>
  );
}
