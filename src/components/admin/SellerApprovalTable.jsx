import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellers, updateSellerStatus } from '../../store/adminSellerSlice';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const SellerApprovalTable = () => {
    const dispatch = useDispatch();
    const { sellers, loading, error, updateLoading } = useSelector((state) => state.adminSeller);

    // Fetch pending sellers on component mount
    useEffect(() => {
        // We only want to see sellers who are pending approval
        dispatch(fetchSellers('PENDING_VERIFICATION'));
    }, [dispatch]);

    // Handle Approve/Suspend actions
    const handleStatusChange = (sellerId, newStatus) => {
        if (window.confirm(`Are you sure you want to change this seller's status to ${newStatus}?`)) {
            dispatch(updateSellerStatus({ sellerId, status: newStatus }));
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
        <div className="bg-white shadow rounded-lg overflow-hidden">
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
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {seller.businessDetails?.businessName || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Owner: {seller.sellerName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{seller.email}</div>
                                        <div className="text-sm text-gray-500">{seller.mobile}</div>
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
                                        <button
                                            onClick={() => handleStatusChange(seller.id, 'ACTIVE')}
                                            disabled={updateLoading}
                                            className="inline-flex items-center text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-2 mr-2 disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                        </button>

                                        <button
                                            onClick={() => handleStatusChange(seller.id, 'SUSPENDED')}
                                            disabled={updateLoading}
                                            className="inline-flex items-center text-red-700 bg-red-100 hover:bg-red-200 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-2 disabled:opacity-50"
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
        </div>
    );
};

export default SellerApprovalTable;
