"use client";

import { useState, useEffect } from "react";
import {
  FiCheck,
  FiTrash2,
  FiX,
  FiSearch,
  FiChevronsDown,
  FiChevronUp,
  FiChevronsUp,
} from "react-icons/fi";
import { format } from "date-fns";

interface Certification {
  id: string;
  username: string;
  certification_name: string;
  level: string;
  du: string;
  nomination_date: string;
  approved_by_manager?: boolean;
  approved_by_du_head?: boolean;
  remarks_manager?: string;
  remarks_duhead?: string;
}

const LdPendingActionsList = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [processingIds, setProcessingIds] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const response = await fetch("ldpendingaction.json");
        const data = await response.json();
        setCertifications(data);
      } catch (error) {
        console.error("Error fetching certifications:", error);
      }
    };
    fetchCertifications();
  }, []);

  // Function to handle Approve/Reject
  const handleAction = async (certId: string, actionType: string) => {
    setProcessingIds((prev) => ({ ...prev, [certId]: true })); // Start processing

    try {
      const response = await fetch(
        `/api/certifications/${certId}/${actionType}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        // Remove certification from UI only if the API call succeeds
        setCertifications((prev: Certification[]) =>
          prev.filter((cert) => cert.id !== certId)
        );
      } else {
        console.error(`Failed to ${actionType}`);
        // Optionally, notify the user about the failure here
      }
    } catch (error) {
      console.error(`Error while trying to ${actionType}:`, error);
      alert(`Failed to ${actionType}. Please try again.`);
    } finally {
      setProcessingIds((prev) => ({ ...prev, [certId]: false })); // Stop processing
    }
  };

  const handleRejectClick = (cert: Certification) => {
    setProcessingIds((prev) => ({ ...prev, [cert.id]: true })); // Start processing
    setSelectedCert(cert);
    setShowModal(true);
    document.body.classList.add("overflow-hidden"); // Prevent scrolling
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.classList.remove("overflow-hidden"); // Restore scrolling
  };

  const confirmRejection = async () => {
    if (!selectedCert) return;

    try {
      const response = await fetch(
        `/api/certifications/${selectedCert.id}/reject`,
        { method: "POST" }
      );

      if (response.ok) {
        setCertifications((prev) =>
          prev.filter((cert) => cert.id !== selectedCert.id)
        );
      } else {
        console.error("Failed to reject");
      }
    } catch (error) {
      console.error("Error rejecting certification:", error);
    } finally {
      setProcessingIds((prev) => ({ ...prev, [selectedCert.id]: false })); // Stop processing
      closeModal();
    }
  };

  const filteredCertifications = certifications.filter(
    (cert) =>
      cert.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certification_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cert.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.du.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-white flex flex-col rounded-lg m-3 overflow-x-hidden h-full">
      {/* Search Input */}
      <div className="mb-2 space-y-4 overflow-y-auto">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search certifications..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg  focus:outline-none focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Certifications List or Empty State */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {filteredCertifications.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg min-h-[150px] flex items-center justify-center">
            <p className="text-gray-500 text-lg">No certifications found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredCertifications.map((cert) => (
              <div
                key={cert.id}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] p-3"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {cert.certification_name}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {cert.level}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between">
                    <p className="text-black-600 font-semibold">
                      {cert.username}
                    </p>
                    <p className="text-gray-500 font-semibold text-xs bg-slate-200 rounded-lg p-1 inline-block">
                      {cert.du}
                    </p>
                  </div>

                  <div>
                  <p className="text-gray-600 mt-1">
                    {formatDate(cert.nomination_date)}
                  </p>
                </div>
                <div className="flex justify-evenly items-center py-4 ">
                  <button
                    className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors duration-200 ${
                      processingIds[cert.id]
                        ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                    onClick={() => handleAction(cert.id, "approve")}
                    disabled={processingIds[cert.id]} // Disable only the button being processed
                  >
                    <FiCheck className="mr-1" />
                    Approve
                  </button>

                  <button
                    className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors duration-200 ${
                      processingIds[cert.id]
                        ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                    onClick={() => handleRejectClick(cert)}
                    disabled={processingIds[cert.id]} // Disable only the button being processed
                  >
                    <FiX className="mr-1" />
                    Reject
                  </button>
                </div>
                </div>

                <div className="flex flex-col gap-4 ">
                  <button
                    className="  text-black px-1 py-1 
              font-thin 
             transition-all 
             duration-300 transform hover:scale-105 active:scale-95 text-sm flex items-center justify-center underline"
                    onClick={() => setIsVisible(!isVisible)}
                  >
                    {isVisible ? "Hide" : "Show"} More Details{" "}
                    {isVisible ? <FiChevronsUp /> : <FiChevronsDown />}
                  </button>

                  {isVisible && (
                    <div className=" border-t border-gray-100">
                      <div className="relative inline-block p-2 rounded-lg">
                        <p className="text-gray-600">
                          Approved by Manager:{" "}
                          {cert.approved_by_manager ? "Yes" : "No"}
                        </p>
                        <p className="text-gray-600">
                          Approved by DU Head:{" "}
                          {cert.approved_by_du_head ? "Yes" : "No"}
                        </p>
                      </div>

                      <div className="w-full">
                        <ul className="space-y-1">
                          <li className="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-150">
                            <strong>Manager Remarks:</strong>
                            <p className="text-sm text-gray-600">
                              {cert.remarks_manager || "No remarks provided"}
                            </p>
                          </li>
                          <li className="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-150">
                            <strong>DU Head Remarks:</strong>
                            <p className="text-sm text-gray-600">
                              {cert.remarks_duhead || "No remarks provided"}
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Rejection
            </h3>
            <p className="text-gray-600 my-4">
              Are you sure you want to reject{" "}
              <b>{selectedCert?.certification_name}</b>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                onClick={confirmRejection}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LdPendingActionsList;
