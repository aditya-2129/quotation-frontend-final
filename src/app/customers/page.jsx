"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { customerService } from '@/services/customers';
import ActionButtons from '@/components/shared/ActionButtons';
import CustomerModal from '@/components/modals/CustomerModal';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, row: null });
  const [errorDetails, setErrorDetails] = useState({ open: false, message: '' });
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 25;

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await customerService.listCustomers(limit, (page - 1) * limit, searchQuery);
      setCustomers(response.documents);
      setTotal(response.total);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Unable to load customers. Please check your Appwrite collection permissions and IDs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, searchQuery]);

  const openEditModal = (customer) => {
     setSelectedCustomer(customer);
     setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
     setIsModalOpen(false);
     setSelectedCustomer(null);
  };

  const handleDelete = (customer) => {
     setDeleteConfirm({ open: true, row: customer });
  };

  const commitDelete = async () => {
     const customer = deleteConfirm.row;
     if (!customer) return;
     try {
        await customerService.deleteCustomer(customer.$id);
        fetchCustomers();
     } catch (e) {
        setErrorDetails({ open: true, message: e.message || "Failed to remove customer record." });
     } finally {
        setDeleteConfirm({ open: false, row: null });
     }
  };

  return (
    <DashboardLayout 
      title="Customer Base" 
      primaryAction={
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-[13px] font-bold text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Customer
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
           <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder="Search by name, location or email..." 
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-200 bg-zinc-50 transition-all focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:outline-none"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset to page 1 on new search
                }}
              />
              <svg className="h-4 w-4 absolute left-3 top-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
           </div>
           <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Total Records: {total}
           </div>
        </div>

        {error && (
           <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {error}
           </div>
        )}

        <section className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-semibold text-zinc-400 uppercase tracking-widest border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Organization</th>
                  <th className="px-6 py-4 font-bold">Contact Person</th>
                  <th className="px-6 py-4 font-bold">Location</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Phone</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {isLoading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-zinc-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-28 bg-zinc-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-zinc-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 rounded" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-zinc-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-zinc-400 italic font-medium">
                       No customer records found matching the current search query.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.$id} className="group hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 min-w-[32px] rounded-md bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">
                              {customer.name?.substring(0, 1) || 'C'}
                           </div>
                           <span className="font-bold text-zinc-900 tracking-tight">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 font-medium">{customer.contact_person || "—"}</td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                            <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="truncate max-w-[120px]">{customer.location || "N/A"}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 font-mono text-[11px]">{customer.email || "—"}</td>
                      <td className="px-6 py-4 text-zinc-600 font-mono text-[11px]">{customer.phone || "—"}</td>
                      <td className="px-6 py-4 text-right">
                         <ActionButtons 
                           onEdit={() => openEditModal(customer)} 
                           onDelete={() => handleDelete(customer)} 
                         />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
             <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">
                Showing {Math.min(total, (page - 1) * limit + 1)} - {Math.min(total, page * limit)} of {total}
             </div>
             <div className="flex items-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="h-8 px-3 rounded-md border border-zinc-200 bg-white text-xs font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1 px-2 text-[11px] font-bold text-zinc-900 mono">
                   {page} <span className="text-zinc-300 font-normal">/</span> {Math.ceil(total / limit) || 1}
                </div>
                <button 
                  disabled={page >= Math.ceil(total / limit)}
                  onClick={() => setPage(p => p + 1)}
                  className="h-8 px-3 rounded-md border border-zinc-200 bg-white text-xs font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Next
                </button>
             </div>
          </div>
        </section>
      </div>

      {isModalOpen && (
         <CustomerModal 
            customer={selectedCustomer} 
            onClose={closeAndResetModal} 
            onSuccess={() => {
              closeAndResetModal();
              fetchCustomers();
            }} 
            onError={(msg) => setErrorDetails({ open: true, message: msg })}
         />
      )}

      <ConfirmationModal 
         isOpen={deleteConfirm.open}
         onClose={() => setDeleteConfirm({ open: false, row: null })}
         onConfirm={commitDelete}
         title="Delete Customer?"
         message={`Are you sure you want to permanently remove ${deleteConfirm.row?.name || 'this customer record'}? This action is irreversible.`}
         confirmText="DELETE RECORD"
         cancelText="CANCEL"
         type="danger"
      />

      <ConfirmationModal 
         isOpen={errorDetails.open}
         onClose={() => setErrorDetails({ open: false, message: '' })}
         onConfirm={() => setErrorDetails({ open: false, message: '' })}
         title="REGISTRY ERROR"
         message={errorDetails.message}
         confirmText="CLOSE"
         type="danger"
      />
    </DashboardLayout>
  );
}
