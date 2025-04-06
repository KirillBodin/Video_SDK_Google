import React from "react";

class DeviceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasDeviceError: false };
  }

  static getDerivedStateFromError(error) {
    if (error.message && error.message.toLowerCase().includes("requested device not found")) {
      return { hasDeviceError: true };
    }
    return null;
  }

  componentDidCatch(error, errorInfo) {
    
    if (!(error.message && error.message.toLowerCase().includes("requested device not found"))) {
      console.error("Meeting error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasDeviceError) {
     
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export default DeviceErrorBoundary;
