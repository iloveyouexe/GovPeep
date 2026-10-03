import { useState } from "react";

interface FOIARequestFormProps {
    agency: {
        "Name": string;
        Description: string;
        Website: string;
        "Phone Number": string | null;
    };
    onClose: () => void;
}

type TemplateType = "federal" | "state" | "appeal" | "fee_waiver";

const TEMPLATES: Record<TemplateType, { name: string; description: string }> = {
    federal: {
        name: "Federal FOIA Request",
        description: "Standard request under the Freedom of Information Act (5 U.S.C. § 552)"
    },
    state: {
        name: "State Records Request",
        description: "Request under state open records laws (e.g., Missouri Sunshine Law)"
    },
    appeal: {
        name: "FOIA Appeal",
        description: "Appeal a denial of a previous FOIA request"
    },
    fee_waiver: {
        name: "Fee Waiver Request",
        description: "Request a waiver of fees for public interest disclosure"
    }
};

const FOIARequestForm = ({ agency, onClose }: FOIARequestFormProps) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [templateType, setTemplateType] = useState<TemplateType>("federal");
    
    // Contact Info
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [fax, setFax] = useState("");
    
    // Address
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zip, setZip] = useState("");
    
    // Request Details
    const [recordsDescription, setRecordsDescription] = useState("");
    const [requesterType, setRequesterType] = useState("");
    const [maxFees, setMaxFees] = useState("");
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const isStep1Valid = templateType;
    const isStep2Valid = fullName.trim() && email.trim() && address.trim() && city.trim() && state.trim() && zip.trim();
    const isStep3Valid = recordsDescription.trim();

    const handleSubmit = async () => {
        if (!isStep3Valid) return;
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const inputClass = "w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all";
    const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">FOIA Request</h2>
                        <p className="text-sm text-gray-400">{agency.Name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {isSubmitted ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Request Generated</h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                Your {TEMPLATES[templateType].name} for <strong className="text-white">{agency.Name}</strong> has been generated. Check your email for the complete letter.
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Progress Steps */}
                            <div className="flex items-center justify-center gap-2 mb-8">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                            step >= s ? "bg-blue-600 text-white" : "bg-white/10 text-gray-500"
                                        }`}>
                                            {s}
                                        </div>
                                        {s < 3 && (
                                            <div className={`w-12 h-0.5 mx-1 ${step > s ? "bg-blue-600" : "bg-white/10"}`} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Step 1: Template Selection */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white mb-4">Select Request Type</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(Object.entries(TEMPLATES) as [TemplateType, typeof TEMPLATES[TemplateType]][]).map(([key, template]) => (
                                            <button
                                                key={key}
                                                onClick={() => setTemplateType(key)}
                                                className={`p-4 rounded-xl border text-left transition-all ${
                                                    templateType === key
                                                        ? "border-blue-500 bg-blue-500/10"
                                                        : "border-white/20 bg-white/5 hover:bg-white/10"
                                                }`}
                                            >
                                                <div className="font-medium text-white mb-1">{template.name}</div>
                                                <div className="text-xs text-gray-400">{template.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Contact Information */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white mb-4">Your Information</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
                                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Email <span className="text-red-400">*</span></label>
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Phone</label>
                                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Fax</label>
                                            <input type="tel" value={fax} onChange={(e) => setFax(e.target.value)} placeholder="(555) 123-4568" className={inputClass} />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <label className={labelClass}>Street Address <span className="text-red-400">*</span></label>
                                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street" className={inputClass} />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="col-span-2">
                                            <label className={labelClass}>City <span className="text-red-400">*</span></label>
                                            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Washington" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>State <span className="text-red-400">*</span></label>
                                            <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="DC" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>ZIP <span className="text-red-400">*</span></label>
                                            <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="20001" className={inputClass} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Request Details */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white mb-4">Request Details</h3>
                                    
                                    <div>
                                        <label className={labelClass}>Records Description <span className="text-red-400">*</span></label>
                                        <textarea
                                            value={recordsDescription}
                                            onChange={(e) => setRecordsDescription(e.target.value)}
                                            placeholder="Describe the records you are requesting with enough detail for the agency to locate them. Include names, dates, and any identifying information..."
                                            rows={5}
                                            className={inputClass + " resize-none"}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Requester Category</label>
                                        <select
                                            value={requesterType}
                                            onChange={(e) => setRequesterType(e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="">Select category...</option>
                                            <option value="media">News Media Representative</option>
                                            <option value="educational">Educational/Scientific Institution</option>
                                            <option value="commercial">Commercial Use</option>
                                            <option value="personal">Personal Use</option>
                                            <option value="nonprofit">Non-profit Organization</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Maximum Fee Willing to Pay</label>
                                        <input
                                            type="text"
                                            value={maxFees}
                                            onChange={(e) => setMaxFees(e.target.value)}
                                            placeholder="$25.00"
                                            className={inputClass}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Leave blank to be contacted before any fees are incurred</p>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                                {step > 1 ? (
                                    <button
                                        onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                                        className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors"
                                    >
                                        ← Back
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {step < 3 ? (
                                    <button
                                        onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                                        disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                                    >
                                        Continue →
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!isStep3Valid || isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Generating...
                                            </>
                                        ) : (
                                            "Generate Request"
                                        )}
                                    </button>
                                )}
                            </div>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                This is a demo. Your request letter will be generated based on official FOIA templates.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FOIARequestForm;
