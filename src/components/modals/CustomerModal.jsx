import React, { useState } from 'react';
import { customerService } from '@/services/customers';

export default function CustomerModal({ onClose, onSuccess, onError, customer }) {
   const [formData, setFormData] = useState({
      name: customer?.name || '',
      contact_person: customer?.contact_person || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      location: customer?.location || ''
   });
   const [isSubmitting, setIsSubmitting] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         setIsSubmitting(true);
         let result;
         if (customer) {
            result = await customerService.updateCustomer(customer.$id, formData);
         } else {
            result = await customerService.createCustomer(formData);
         }
         onSuccess(result || formData); // Pass back the new/updated customer
      } catch (error) {
         if (onError) onError(`Execution Failure: ${error.message || 'Registry sync failed'}`);
         else console.error("Customer Save Error:", error);
         setIsSubmitting(false);
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm">
         <div className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <header className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
               <h2 className="text-[14px] font-black text-zinc-950 uppercase tracking-[0.25em]">
                  {customer ? 'Edit Customer' : 'Add New Customer'}
               </h2>
               <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                  {customer ? 'Update the details for this customer.' : 'Fill in the details to add a new customer to your list.'}
               </div>
            </header>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                     <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 leading-none">Customer Name *</label>
                     <input 
                        required
                        autoFocus
                        className="w-full h-11 px-4 rounded-lg border border-zinc-200 bg-zinc-50 font-medium focus:ring-2 focus:ring-zinc-950 focus:bg-white focus:outline-none transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 leading-none">Contact Person</label>
                     <input 
                        className="w-full h-11 px-4 rounded-lg border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-zinc-950 focus:bg-white focus:outline-none transition-all"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 leading-none">Location</label>
                     <input 
                        placeholder="e.g. Detroit, MI"
                        className="w-full h-11 px-4 rounded-lg border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-zinc-950 focus:bg-white focus:outline-none transition-all"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 leading-none">Email Address</label>
                     <input 
                        type="email"
                        className="w-full h-11 px-4 rounded-lg border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-zinc-950 focus:bg-white focus:outline-none transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 leading-none">Phone Number</label>
                     <input 
                        className="w-full h-11 px-4 rounded-lg border border-zinc-200 bg-zinc-50 focus:ring-2 focus:ring-zinc-950 focus:bg-white focus:outline-none transition-all"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                     />
                  </div>
               </div>

               <div className="flex gap-3 pt-4 border-t border-zinc-100">
                  <button 
                     type="button"
                     onClick={onClose}
                     className="flex-1 h-11 rounded-xl text-[11px] font-black uppercase tracking-tight text-zinc-500 hover:text-zinc-950 transition-colors"
                  >
                     Cancel
                  </button>
                   <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] h-11 rounded-xl bg-zinc-950 text-white text-[11px] font-black uppercase tracking-tight shadow-xl shadow-zinc-950/20 hover:bg-zinc-900 disabled:opacity-50 transition-all active:scale-[0.98] border border-zinc-800"
                   >
                      {isSubmitting ? 'Saving...' : (customer ? 'Save Changes' : 'Save Customer')}
                   </button>
               </div>
            </form>
         </div>
      </div>
   );
}
