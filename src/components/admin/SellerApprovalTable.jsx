import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellers, updateSellerStatus } from '../../store/adminSellerSlice';
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, Building, MapPin, CreditCard, User, FileText } from 'lucide-react';

const SellerApprovalTable = () => {
    const dispatch = useDispatch();
    const { sellers, loading, error, updateLoading } = useSelector((state) => state.adminSeller);

    // State to manage the preview modal
    const [selectedSeller, setSelectedSeller] = useState(null);

    // Fetch pending sellers on component mount
    useEffect(() => {
        dispatch(fetchSellers('PENDING_VERIFICATION'));
    }, [dispatch]);

    // Handle Approve/Suspend actions
    const handleStatusChange = (sellerId, newStatus) => {
        if (window.confirm(`Are you sure you want to change this seller's status to ${newStatus}?`)) {
            dispatch(updateSellerStatus({ sellerId, status: newStatus }));
            if (selectedSeller && selectedSeller.id === sellerId) {
                setSelectedSeller(null); // Close modal after action
            }
        }
    };

    // Helper function to render status badges
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Active</span>;
            case 'SUSPENDED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" /> Suspended</span>;
            case 'PENDING_VERIFICATION':
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
                <strong>Error loading sellers:</strong> {error}
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden relative">
            <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Seller Approvals
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Review and approve new seller applications.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Details</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GSTIN</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sellers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No pending seller applications found.
                                </td>
                            </tr>
                        ) : (
                            sellers.map((seller) => (
                                <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                                    {/* Business Details */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {seller.businessDetails?.businessName || seller.sellerName || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Shop: {seller.sellerName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{seller.email || seller.user?.email || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{seller.mobile || 'N/A'}</div>
                                    </td>

                                    {/* GSTIN */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                            {seller.gstin || seller.GSTIN || 'Not Provided'}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderStatusBadge(seller.accountStatus)}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {/* View Details Button */}
                                        <button
                                            onClick={() => setSelectedSeller(seller)}
                                            className="inline-flex items-center text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xs px-3 py-2 mr-2 transition-colors"
                                        >
                                            <Eye className="w-4 h-4 mr-1" /> View
                                        </button>

                                        <button
                                            onClick={() => handleStatusChange(seller.id, 'ACTIVE')}
                                            disabled={updateLoading}
                                            className="inline-flex items-center text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-2 mr-2 disabled:opacity-50 transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                        </button>

                                        <button
                                            onClick={() => handleStatusChange(seller.id, 'SUSPENDED')}
                                            disabled={updateLoading}
                                            className="inline-flex items-center text-red-700 bg-red-100 hover:bg-red-200 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-2 disabled:opacity-50 transition-colors"
                                        >
                                            <XCircle className="w-4 h-4 mr-1" /> Reject
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- SELLER PREVIEW MODAL --- */}
            {selectedSeller && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Application Review</h3>
                                <p className="text-sm text-gray-500 mt-1">Reviewing details for: <span className="font-semibold">{selectedSeller.sellerName}</span></p>
                            </div>
                            <button
                                onClick={() => setSelectedSeller(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-8">

                            {/* Section 1: Account & Contact Info */}
                            <div>
                                <h4 className="flex items-center text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2 mb-4">
                                    <User className="w-4 h-4 mr-2" /> Account Information
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">Owner Name</span>
                                        <span className="font-medium">{selectedSeller.user?.fullName || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">Account Email</span>
                                        <span className="font-medium">{selectedSeller.email || selectedSeller.user?.email || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">Account Mobile</span>
                                        <span className="font-medium">{selectedSeller.mobile || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Business Profile */}
                            <div>
                                <h4 className="flex items-center text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2 mb-4">
                                    <Building className="w-4 h-4 mr-2" /> Business Details
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">Shop / Brand Name</span>
                                        <span className="font-medium">{selectedSeller.sellerName || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">Legal Business Name</span>
                                        <span className="font-medium">{selectedSeller.businessDetails?.businessName || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">GSTIN</span>
                                        <span className="font-mono bg-white border border-gray-200 px-2 py-0.5 rounded">{selectedSeller.gstin || selectedSeller.GSTIN || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">Business Email</span>
                                        <span className="font-medium">{selectedSeller.businessDetails?.businessEmail || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">Business Mobile</span>
                                        <span className="font-medium">{selectedSeller.businessDetails?.businessMobile || 'N/A'}</span>
                                    </div>
                                    <div className="col-span-2 md:col-span-3 mt-2">
                                        <span className="block text-gray-400 text-xs mb-1">Registered Business Address</span>
                                        <span className="font-medium">{selectedSeller.businessDetails?.businessAddress || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Bank Details */}
                            <div>
                                <h4 className="flex items-center text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2 mb-4">
                                    <CreditCard className="w-4 h-4 mr-2" /> Bank Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">Account Holder Name</span>
                                        <span className="font-medium">{selectedSeller.bankDetails?.accountHolderName || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">Bank Name</span>
                                        <span className="font-medium">{selectedSeller.bankDetails?.bankName || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">Account Number</span>
                                        <span className="font-mono">{selectedSeller.bankDetails?.accountNumber || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs mb-1">IFSC Code</span>
                                        <span className="font-mono uppercase">{selectedSeller.bankDetails?.ifscCode || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Pickup Address */}
                            <div>
                                <h4 className="flex items-center text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2 mb-4">
                                    <MapPin className="w-4 h-4 mr-2" /> Inventory Pickup Address
                                </h4>
                                <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedSeller.pickupAddress ? (
                                        <>
                                            <div>
                                                <span className="block text-gray-400 text-xs mb-1">Contact Person</span>
                                                <span className="font-medium">{selectedSeller.pickupAddress.name || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-400 text-xs mb-1">Contact Mobile</span>
                                                <span className="font-medium">{selectedSeller.pickupAddress.mobile || 'N/A'}</span>
                                            </div>
                                            <div className="col-span-1 md:col-span-2 mt-2">
                                                <span className="block text-gray-400 text-xs mb-1">Full Address</span>
                                                <div className="font-medium">
                                                    <p>{selectedSeller.pickupAddress.address}</p>
                                                    {selectedSeller.pickupAddress.locality && <p>{selectedSeller.pickupAddress.locality}</p>}
                                                    <p>{selectedSeller.pickupAddress.city}, {selectedSeller.pickupAddress.state}</p>
                                                    <p>PIN: <span className="font-mono">{selectedSeller.pickupAddress.pinCode}</span></p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic col-span-2">No pickup address provided.</p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer / Actions */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedSeller(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleStatusChange(selectedSeller.id, 'SUSPENDED')}
                                disabled={updateLoading}
                                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-transparent rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                            >
                                Reject Application
                            </button>
                            <button
                                onClick={() => handleStatusChange(selectedSeller.id, 'ACTIVE')}
                                disabled={updateLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors"
                            >
                                Approve Seller
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerApprovalTable;
