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
   const [errors, setErrors] = useState({});
   const [isSubmitting, setIsSubmitting] = useState(false);

   const validate = () => {
      const newErrors = {};
      if (!formData.name.trim()) newErrors.name = "Customer name is required";
      if (!formData.contact_person.trim()) newErrors.contact_person = "Contact person is required";
      if (!formData.location.trim()) newErrors.location = "Location is required";
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
         newErrors.email = "Email address is required";
      } else if (!emailRegex.test(formData.email)) {
         newErrors.email = "Invalid email format";
      }

      const phoneRegex = /^\d{10}$/;
      if (!formData.phone.trim()) {
         newErrors.phone = "Phone number is required";
      } else if (!phoneRegex.test(formData.phone)) {
         newErrors.phone = "Must be exactly 10 digits";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const toTitleCase = (str) => {
      if (!str) return '';
      return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validate()) return;

      try {
         setIsSubmitting(true);
         const formattedData = {
            ...formData,
            name: toTitleCase(formData.name),
            contact_person: toTitleCase(formData.contact_person),
            location: toTitleCase(formData.location),
            email: formData.email.toLowerCase().trim() // Ensure email is lowercased
         };

         let result;
         if (customer) {
            result = await customerService.updateCustomer(customer.$id, formattedData);
         } else {
            result = await customerService.createCustomer(formattedData);
         }
         onSuccess(result || formattedData); // Pass back the new/updated customer
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
                     <label className="block text-[10px] font-bold text-zinc-950 uppercase tracking-widest mb-1.5 leading-none flex justify-between">
                        <span>Customer Name <span className="text-red-500 font-black ml-1">*</span></span>
                        {errors.name && <span className="text-red-500 normal-case font-bold">{errors.name}</span>}
                     </label>
                     <input 
                        required
                        autoFocus
                        className={`w-full h-11 px-4 rounded-lg border font-medium focus:ring-2 focus:ring-zinc-950 focus:bg-white focus:outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-zinc-200 bg-zinc-50'}`}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-zinc-950 uppercase tracking-widest mb-1.5 leading-none flex justify-between">
                        <span>Contact Person <span className="text-red-500 font-black ml-1">*</span></span>
                        {errors.contact_person && <span className="text-red-500 normal-case font-bold">{errors.contact_person}</span>}
                     </label>
                     <input 
                        required
                        className={`w-full h-11 px-4 rounded-lg border focus:ring-2 focus:ring-zinc-950 focus:bg-white focus:outline-none transition-all ${errors.contact_person ? 'border-red-500 bg-red-50' : 'border-zinc-200 bg-zinc-50'}`}
                        value={formData.contact_person}
                        onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-zinc-950 uppercase tracking-widest mb-1.5 leading-none flex justify-between">
                        <span>Location <span className="text-red-500 font-black ml-1">*</span></span>
                        {errors.location && <span className="text-red-500 normal-case font-bold">{errors.location}</span>}
                     </label>
                     <input 
                        required
                        placeholder="e.g. Detroit, MI"
                        className={`w-full h-11 px-4 rounded-lg border focus:ring-2 focus:ring-zinc-950 focus:bg-white focus:outline-none transition-all ${errors.location ? 'border-red-500 bg-red-50' : 'border-zinc-200 bg-zinc-50'}`}
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-zinc-950 uppercase tracking-widest mb-1.5 leading-none flex justify-between">
                        <span>Email Address <span className="text-red-500 font-black ml-1">*</span></span>
                        {errors.email && <span className="text-red-500 normal-case font-bold text-[8px]">{errors.email}</span>}
                     </label>
                     <input 
                        required
                        type="email"
                        className={`w-full h-11 px-4 rounded-lg border focus:ring-2 focus:ring-zinc-950 focus:bg-white focus:outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-zinc-200 bg-zinc-50'}`}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-zinc-950 uppercase tracking-widest mb-1.5 leading-none flex justify-between">
                        <span>Phone Number <span className="text-red-500 font-black ml-1">*</span></span>
                        {errors.phone && <span className="text-red-500 normal-case font-bold text-[8px]">{errors.phone}</span>}
                     </label>
                     <input 
                        required
                        maxLength="10"
                        className={`w-full h-11 px-4 rounded-lg border focus:ring-2 focus:ring-zinc-950 focus:bg-white focus:outline-none transition-all ${errors.phone ? 'border-red-500 bg-red-50' : 'border-zinc-200 bg-zinc-50'}`}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
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
