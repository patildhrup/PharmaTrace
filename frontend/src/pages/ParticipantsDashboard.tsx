import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface Role {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
}

const ParticipantsDashboard: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('adminAuth')) {
            navigate('/admin-login');
        }
    }, [navigate]);

    const roles: Role[] = [
        {
            id: 'supplier',
            name: 'Supplier',
            icon: '🏭',
            description: 'Raw material suppliers and ingredient providers',
            color: 'from-blue-500 to-blue-600'
        },
        {
            id: 'manufacturer',
            name: 'Manufacturer',
            icon: '⚗️',
            description: 'Drug manufacturing and production facilities',
            color: 'from-purple-500 to-purple-600'
        },
        {
            id: 'distributor',
            name: 'Distributor',
            icon: '📦',
            description: 'Wholesale distributors and regional centers',
            color: 'from-orange-500 to-orange-600'
        },
        {
            id: 'retailer',
            name: 'Retailer',
            icon: '🏥',
            description: 'Pharmacies, hospitals, and retail outlets',
            color: 'from-green-500 to-green-600'
        }
    ];

    const handleRoleSelect = (roleId: string) => {
        navigate(`/role-dashboard/${roleId}`);
    };

    return (
        <div className="min-h-screen relative overflow-hidden transition-colors duration-300" style={{
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {/* Header */}
            <div className="bg-[#111] border-b border-[rgba(34,197,94,0.2)] relative z-10">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin-dashboard')}
                                className="text-brand-green hover:text-white transition-colors"
                            >
                                ← Back
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold"><span className="text-brand-green">Participants</span> Hub</h1>
                                <p className="text-white/70">Select a participant role to manage</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            onClick={() => handleRoleSelect(role.id)}
                            className="group bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-2xl p-8 hover:border-brand-green transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-brand-green/20 cursor-pointer"
                        >
                            <div className="text-center">
                                <div className={`w-24 h-24 bg-gradient-to-r ${role.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <span className="text-4xl">{role.icon}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-brand-green transition-colors">
                                    {role.name}
                                </h3>
                                <p className="text-white/70 text-base mb-6">{role.description}</p>
                                <div className="bg-brand-green text-black px-6 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-md">
                                    Manage {role.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ParticipantsDashboard;
