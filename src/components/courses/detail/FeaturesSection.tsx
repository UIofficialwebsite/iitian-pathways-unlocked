import React from 'react';
import { CheckCircle } from 'lucide-react';

interface FeaturesSectionProps {
    features?: string[] | null;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
    // This check prevents the "Cannot read properties of undefined (reading 'features')" error.
    if (!features || features.length === 0) {
        return (
            <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Features</h2>
                <p className="text-gray-600">Key features of this course will be listed here soon.</p>
            </section>
        )
    }

    return (
        <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Top Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start text-lg">
                        <CheckCircle className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-800">{feature}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;
