"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { quotationService } from '@/services/quotations';
import { customerService } from '@/services/customers';
import { materialService } from '@/services/materials';
import { laborRateService, toolingRateService, bopRateService } from '@/services/rates';
import CustomerModal from '@/components/modals/CustomerModal';
import ScopeAndIdentity from '@/components/quotations/ScopeAndIdentity';
import BOMRegistry from '@/components/quotations/BOMRegistry';
import RawMaterial from '@/components/quotations/RawMaterial';
import MachiningLogic from '@/components/quotations/MachiningLogic';
import BroughtOutParts from '@/components/quotations/BoughtOutParts';
import TechnicalSpecifications from '@/components/quotations/TechnicalSpecifications';
import OperationalTooling from '@/components/quotations/OperationalTooling';
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
    tooling: []
  });

  useEffect(() => {
    setMounted(true);
    
    const initializePage = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch Master Data
        const [c, m, l, t, b] = await Promise.all([
          customerService.listCustomers(100),
          materialService.listMaterials(100),
          laborRateService.listRates(100),
          toolingRateService.listRates(100),
          bopRateService.listRates(100)
        ]);
        
        const libs = {
          customers: c.documents,
          materials: m.documents,
          labor: l.documents,
          tooling: t.documents,
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
          items: parsedItems.length > 0 ? parsedItems : [{
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
              tooling: [],
              bought_out_items: [],
              design_files: []
          }]
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
    tooling: [],
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
    let toolingTotal = 0;
    let bopTotal = 0;
    let treatmentTotal = 0;
    let qualityTotal = 0;
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

      toolingTotal += (item.tooling || []).reduce((acc, t) => acc + (parseFloat(t.rate || 0) * parseFloat(t.qty || 1)), 0);

      treatmentTotal += (item.treatments || []).reduce((acc, t) => acc + (parseFloat(t.cost || 0) * (t.per_unit !== false ? quantity : 1)), 0);

      if (item.inspection?.cmm || item.inspection?.mtc) {
          const cmmCost = parseFloat(item.inspection.cmm ? (item.inspection.cmm_cost || 0) : 0);
          const mtcCost = parseFloat(item.inspection.mtc ? (item.inspection.mtc_cost || 0) : 0);
          qualityTotal += (cmmCost + mtcCost) * quantity;
      }

      bopTotal += (item.bought_out_items || []).reduce((acc, b) => acc + (parseFloat(b.rate || 0) * (b.qty || 1) * quantity), 0);
    });
    
    const commercialTotal = parseFloat(formData.packaging_cost || 0) + parseFloat(formData.transportation_cost || 0);
    const subtotal = materialTotal + laborTotal + toolingTotal + bopTotal + treatmentTotal + qualityTotal + projectEngineeringTotal + commercialTotal;
    const finalTotal = subtotal * (1 + (formData.markup / 100));
    
    return { 
      subtotal, 
      finalTotal, 
      materialCost: materialTotal, 
      laborCost: laborTotal, 
      toolingCost: toolingTotal, 
      bopCost: bopTotal, 
      treatmentCost: treatmentTotal, 
      qualityCost: qualityTotal,
      engineeringCost: projectEngineeringTotal,
      commercialCost: commercialTotal
    };
  };

  const totals = calculateTotals();

  const handleUpdate = async () => {
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
        <DashboardLayout title="Engineering Workspace">
           <div className="flex h-64 items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 animate-pulse">Syncing with Central Repository...</span>
           </div>
        </DashboardLayout>
     );
  }

  return (
    <DashboardLayout 
      title={`Editing Valuation: ${formData.quotation_no}`}
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

            <OperationalTooling 
               activePhase={activePhase}
               setActivePhase={setActivePhase}
               formData={formData}
               setFormData={setFormData}
               libraries={libraries}
               panelIndex={5}
            />

             <TechnicalSpecifications 
                activePhase={activePhase}
                setActivePhase={setActivePhase}
                formData={formData}
                setFormData={setFormData}
                panelIndex={6}
             />

            <BroughtOutParts
               activePhase={activePhase}
               setActivePhase={setActivePhase}
               formData={formData}
               setFormData={setFormData}
               libraries={libraries}
               panelIndex={7}
            />

             <CommercialAdjustments 
                activePhase={activePhase}
                setActivePhase={setActivePhase}
                formData={formData}
                setFormData={setFormData}
                panelIndex={8}
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
