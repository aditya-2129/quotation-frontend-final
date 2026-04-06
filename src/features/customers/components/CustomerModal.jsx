'use client';

import React, { useState } from 'react';
import { THEME } from '@/constants/ui';
import { X, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { useCreateCustomer, useUpdateCustomer } from '../api/useCustomers';

export const CustomerModal = ({ customer, onClose, onError }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    contact_person: customer?.contact_person || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    location: customer?.location || ''
  });

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const isSubmitting = createCustomer.isPending || updateCustomer.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (customer) {
        await updateCustomer.mutateAsync({ id: customer.$id, data: formData });
      } else {
        await createCustomer.mutateAsync(formData);
      }
      onClose();
    } catch (err) {
      onError(err.message || "Failed to update record.");
    }
  };

  const InputField = ({ label, icon: Icon, type = "text", field, placeholder, required = false }) => (
    <div className="space-y-1.5">
      <label className="block font-bold text-zinc-400 uppercase tracking-widest" style={{ fontSize: THEME.FONT_SIZE.TINY }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-brand-primary transition-colors">
          <Icon className="h-4 w-4" />
        </div>
        <input
          required={required}
          type={type}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 font-bold focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all placeholder:font-normal"
          style={{ fontSize: THEME.FONT_SIZE.BASE }}
          placeholder={placeholder}
          value={formData[field]}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm" style={{ zIndex: THEME.Z_INDEX.MODAL }}>
      <div className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-zinc-950 tracking-tight" style={{ fontSize: THEME.FONT_SIZE.XLARGE }}>
              {customer ? 'Update Partner Profile' : 'Register New Client'}
            </h2>
            <p className="text-zinc-500 mt-1 font-medium" style={{ fontSize: THEME.FONT_SIZE.SMALL }}>
              Maintain accurate organizational and contact intelligence.
            </p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <InputField label="Organization Name" icon={Briefcase} field="name" placeholder="Company Name Ltd." required />
          
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Primary Contact" icon={User} field="contact_person" placeholder="Name of person" />
            <InputField label="Location / City" icon={MapPin} field="location" placeholder="e.g. Pune, MH" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Email Address" type="email" icon={Mail} field="email" placeholder="client@example.com" />
            <InputField label="Phone Number" type="tel" icon={Phone} field="phone" placeholder="Contact number" />
          </div>

          <div className="flex gap-4 pt-6 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold text-zinc-400 hover:text-zinc-950 transition-colors">
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] h-12 rounded-xl bg-zinc-950 text-white font-bold shadow-xl hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Syncing...' : (customer ? 'Update Profile' : 'Create Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
