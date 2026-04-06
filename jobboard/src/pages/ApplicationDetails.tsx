import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import EmployerAppView from "./EmployerAppView";
import CandidateAppView from "./CandidateAppView";

export default function ApplicationDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [app, setApp] = useState<any>(null);

  const fetchApp = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      setApp(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchApp(); }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/applications/${id}/status`, { status });
      fetchApp();
    } catch (err) { alert("Error"); }
  };

  if (!app) return <div className="container" style={{padding: '100px', textAlign: 'center'}}>Loading...</div>;

  // РАЗДЕЛЯЕМ ВИЗУАЛ В ЗАВИСИМОСТИ ОТ РОЛИ
  return user?.role === 'employer' 
    ? <EmployerAppView app={app} updateStatus={updateStatus} />
    : <CandidateAppView app={app} />;
}