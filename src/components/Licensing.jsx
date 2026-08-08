import React, { useState, useEffect } from 'react';
import './Licensing.scss';
import { Lock, ExternalLink, AlertTriangle, Calendar, Clock, KeyRound } from 'lucide-react';
import imcLogo from '../assets/images/imclogo_new.jpeg';
import licenseBg from '../assets/images/licensing.png';

const LICENSE_API_ENDPOINT = 'https://activate.imcbs.com/mobileapp/api/project/customdev/';
const CURRENT_CLIENT_ID = "2W08574LAKNIC"; // Panama Signature Properties
const CUSTOMER_LABEL = "Panama Signature Properties";
const POLL_INTERVAL = 3000;

// Fallback license data (used only if the API is unreachable) — keep Active for production
const DEFAULT_LICENSE_DATA = {
  "success": true,
  "project_name": "Custom Dev",
  "demo_licenses": [],
  "customers": [
    {
      "customer_name": "Panama Signature Properties",
      "client_id": "2W08574LAKNIC",
      "license_key": "BAPM-H2KF-8FZ7-9F32",
      "package": "Custom Dev",
      "modules": [{ "module_name": "Custom Dev", "module_code": "MOD062" }],
      "license_summary": { "registered_devices": 0, "max_devices": 0 },
      "license_validity": { "expiry_date": "2027-08-07", "remaining_days": 364, "is_expired": false },
      "registered_devices": [],
      "status": "Active"
    }
  ]
};

// ───────────────────────── Notice screen ─────────────────────────
const NoticeShell = ({ statusCode, headline, message, customer, onRefresh, showButton }) => (
  <div
    className="lic-overlay"
    style={{ backgroundImage: `url(${licenseBg})` }}
  >
    <div className="lic-frame">
      <div className="lic-seal">
        <AlertTriangle size={90} className="lic-seal-icon" strokeWidth={1.5} />
      </div>

      <h1 className="lic-headline">{headline}</h1>
      <p className="lic-message">{message}</p>

      {customer && (
        <div className="lic-record">
          <div className="lic-record-head">License Status</div>
          <div className="lic-record-status">
            <AlertTriangle size={20} />
            <span>{customer.status}</span>
            <AlertTriangle size={20} />
          </div>

          <div className="lic-row-group">
            {customer.license_validity?.expiry_date && (
              <div className="lic-row">
                <Calendar size={16} className="lic-row-icon" />
                <span>
                  <span className="lic-label">Expiry Date</span>
                  <span className="lic-value lic-mono">{customer.license_validity.expiry_date}</span>
                </span>
              </div>
            )}

            {customer.license_validity?.remaining_days !== null &&
              customer.license_validity?.remaining_days !== undefined && (
              <div className="lic-row">
                <Clock size={16} className="lic-row-icon" />
                <span>
                  <span className="lic-label">Remaining Days</span>
                  <span className="lic-value lic-mono">{customer.license_validity.remaining_days}</span>
                </span>
              </div>
            )}

            <div className="lic-row">
              <KeyRound size={16} className="lic-row-icon" />
              <span>
                <span className="lic-label">License Key</span>
                <span className="lic-value lic-mono">{customer.license_key}</span>
              </span>
            </div>
          </div>

          <div className="lic-row lic-row-full">
            <span className="lic-label">Customer</span>
            <span className="lic-value">{customer.customer_name}</span>
          </div>
        </div>
      )}

      {showButton && (
        <button onClick={onRefresh} className="lic-retry">
          <Lock size={16} />
          Retry Connection
        </button>
      )}

      <div className="lic-footer">
        <a href="mailto:support@imcbs.com" className="lic-help-link">Need Help? Contact Support</a>

        <a href="https://imcbs.com" target="_blank" rel="noopener noreferrer" className="lic-provider">
          <span className="lic-provider-logo">
            <img src={imcLogo} alt="IMCBS logo" />
          </span>
          <span className="lic-provider-meta">
            <span className="lic-provider-name">IMCBS</span>
            <span className="lic-provider-link">Visit website <ExternalLink size={11} /></span>
          </span>
        </a>

        <div className="lic-secure">
          <Lock size={12} />
          <span>Secure license management system</span>
        </div>
      </div>
    </div>
  </div>
);

const Licensing = ({ children }) => {
  const [licenseData, setLicenseData] = useState(null);
  const [error, setError] = useState(null);
  const [forceRefreshCount, setForceRefreshCount] = useState(0);

  const fetchLicenseData = async () => {
    try {
      const response = await fetch(LICENSE_API_ENDPOINT, {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`API returned ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setLicenseData(data);
      setError(null);
    } catch (err) {
      setLicenseData(DEFAULT_LICENSE_DATA);
      setError(err.message);
    }
  };

  const handleManualRefresh = () => {
    setForceRefreshCount(prev => prev + 1);
    fetchLicenseData();
  };

  useEffect(() => {
    fetchLicenseData();
    const pollInterval = setInterval(fetchLicenseData, POLL_INTERVAL);
    return () => clearInterval(pollInterval);
  }, [forceRefreshCount]);

  // First check still resolving -> show app silently. NO loading screen.
  if (!licenseData) {
    return children;
  }

  const customer = licenseData?.customers?.find(c => c.client_id === CURRENT_CLIENT_ID);

  if (!customer || customer.client_id !== CURRENT_CLIENT_ID) {
    return (
      <NoticeShell
        statusCode="ERR 403"
        headline="Access Denied"
        message={`This application is licensed for ${CUSTOMER_LABEL} only. Please contact support@imcbs.com.`}
        customer={null}
        onRefresh={handleManualRefresh}
        showButton={false}
      />
    );
  }

  const isExpired = customer.license_validity.is_expired === true;
  const status = (customer.status || "").toLowerCase().trim();
  const isActive = status === "active";

  if (isExpired || !isActive) {
    const statusCode = isExpired ? "ERR 410" : "ERR 423";
    const headline = isExpired ? "License Expired" : "License Inactive";
    const message = isExpired
      ? "Your application license has expired. Please renew your subscription to continue."
      : "Your application license is currently inactive. Please contact your system administrator to activate it.";

    return (
      <NoticeShell
        statusCode={statusCode}
        headline={headline}
        message={message}
        customer={customer}
        onRefresh={handleManualRefresh}
        showButton={false}
      />
    );
  }

  return children;
};

export default Licensing;