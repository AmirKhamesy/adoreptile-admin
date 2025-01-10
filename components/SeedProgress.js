import { useEffect, useState } from "react";

export default function SeedProgress({ steps, onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalSteps = steps.length;
    if (totalSteps > 0) {
      const increment = 100 / totalSteps;
      const completedSteps = steps.filter(
        (step) => step.status !== "pending"
      ).length;
      setProgress(completedSteps * increment);
    }
  }, [steps]);

  return (
    <div className="seed-progress-container">
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className={`step-item ${step.status}`}>
            <div className="step-icon">
              {step.status === "completed" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                </svg>
              )}
              {step.status === "skipped" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21 7L9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59 21 7z" />
                </svg>
              )}
              {step.status === "pending" && <div className="spinner" />}
            </div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.message}</p>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .seed-progress-container {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1),
            0 2px 4px -2px rgb(0 0 0 / 0.1);
          max-width: 600px;
          margin: 0 auto;
        }

        .progress-bar-container {
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: #0066cc;
          border-radius: 3px;
          transition: width 0.3s ease-in-out;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .step-item {
          display: flex;
          gap: 16px;
          padding: 12px;
          border-radius: 12px;
          transition: all 0.2s ease-in-out;
        }

        .step-item.completed {
          background: #f0f9ff;
        }

        .step-item.skipped {
          background: #f3f4f6;
        }

        .step-item.pending {
          background: #fff;
        }

        .step-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-icon svg {
          width: 16px;
          height: 16px;
          color: #0066cc;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top-color: #0066cc;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .step-content h3 {
          font-size: 16px;
          font-weight: 500;
          margin: 0;
          color: #1f2937;
        }

        .step-content p {
          font-size: 14px;
          color: #6b7280;
          margin: 4px 0 0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
