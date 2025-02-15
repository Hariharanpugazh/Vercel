import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jsPDF } from "jspdf";

const VerifyCertificate = () => {
    const { uniqueId } = useParams();
    const [certificateData, setCertificateData] = useState(null);
    const [error, setError] = useState("");
    const canvasRef = useRef(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/mcq/verify-certificate/${uniqueId}/`);
                if (response.data.status === "success") {
                    const certData = response.data.certificate;
                    
                    let testDate = "Unknown Date";
                    try {
                        const dateResponse = await axios.get(`${API_BASE_URL}/api/mcq/get_cert_date/`, {
                            params: { student_id: certData.studentId, contest_id: certData.contestId }
                        });
                        
                        if (dateResponse.data && dateResponse.data.finish_time) {
                            testDate = new Date(dateResponse.data.finish_time).toLocaleDateString("en-US", {
                                year: "numeric", month: "long", day: "numeric"
                            });
                        }
                    } catch (error) {
                        console.error("Error fetching test date:", error);
                    }
                    
                    let correctAnswers = 0;
                    try {
                        const scoreResponse = await axios.get(`${API_BASE_URL}/api/mcq/get-score/${certData.contestId}/${certData.studentId}/`);
                        if (scoreResponse.data && typeof scoreResponse.data.correct_answers === "number") {
                            correctAnswers = scoreResponse.data.correct_answers;
                        }
                    } catch (error) {
                        console.error("Error fetching correct answers:", error);
                    }
                    
                    setCertificateData({ ...certData, testDate, correctAnswers });
                } else {
                    setError(response.data.message || "Certificate not found.");
                }
            } catch (err) {
                setError("Failed to fetch certificate. Please try again.");
            }
        };
        fetchCertificate();
    }, [uniqueId]);

    useEffect(() => {
        if (certificateData) {
            drawCertificate();
        }
    }, [certificateData]);

    const drawCertificate = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = "/prev_template.png";
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.font = "22px Helvetica";
            ctx.textAlign = "center";
            ctx.fillText(certificateData.studentName, canvas.width / 2, 305);
            ctx.font = "16px Helvetica";
            ctx.fillText(certificateData.contestName, canvas.width / 2, 400);
            ctx.font = "14px Helvetica";
            ctx.font = "12px Helvetica";
            ctx.fillText(`${certificateData.uniqueId}`, 308, 553);
        };
    };


    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold text-center mb-4">Certificate is Verified ✔</h2>
            {error && <p className="text-red-500 text-center">{error}</p>}
            {certificateData && (
                <div className="border p-4 mt-6 rounded shadow-md text-center">
                    <h3 className="text-xl font-bold mb-4">Certificate Preview</h3>
                    <canvas ref={canvasRef} width={800} height={600} className="w-full max-w-3xl mx-auto"></canvas>
                </div>
            )}
        </div>
    );
};

export default VerifyCertificate;
