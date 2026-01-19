import PropTypes from 'prop-types';

const VerificationBadge = ({ status, size = 'md', showText = true }) => {
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    const iconSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    const config = {
        verified: {
            icon: '✓',
            text: 'Verified Researcher',
            bgColor: 'bg-green-500/20',
            textColor: 'text-green-400',
            borderColor: 'border-green-500/50',
        },
        pending: {
            icon: '⏳',
            text: 'Pending Verification',
            bgColor: 'bg-yellow-500/20',
            textColor: 'text-yellow-400',
            borderColor: 'border-yellow-500/50',
        },
        under_review: {
            icon: '🔍',
            text: 'Under Review',
            bgColor: 'bg-blue-500/20',
            textColor: 'text-blue-400',
            borderColor: 'border-blue-500/50',
        },
        rejected: {
            icon: '✗',
            text: 'Verification Required',
            bgColor: 'bg-red-500/20',
            textColor: 'text-red-400',
            borderColor: 'border-red-500/50',
        },
        unverified: {
            icon: '○',
            text: 'Unverified',
            bgColor: 'bg-gray-500/20',
            textColor: 'text-gray-400',
            borderColor: 'border-gray-500/50',
        },
    };

    const currentConfig = config[status] || config.unverified;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses[size]} ${currentConfig.bgColor} ${currentConfig.textColor} ${currentConfig.borderColor}`}
            title={currentConfig.text}
        >
            <span className={iconSizes[size]}>{currentConfig.icon}</span>
            {showText && <span>{currentConfig.text}</span>}
        </span>
    );
};

VerificationBadge.propTypes = {
    status: PropTypes.oneOf(['verified', 'pending', 'under_review', 'rejected', 'unverified']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    showText: PropTypes.bool,
};

export default VerificationBadge;
