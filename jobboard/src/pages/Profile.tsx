/* Profile.tsx */
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function ProfilePage() {
  // Достаем setUser, чтобы обновлять данные в хедере мгновенно
  const { user, setUser } = useAuth(); 
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Состояние загрузки аватара

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        const data = res.data.user || res.data;
        setProfile(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || ""
        });
      } catch (err) { 
        console.error("Profile fetch error:", err); 
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ФУНКЦИЯ ЗАГРУЗКИ АВАТАРА
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", file);

    setUploading(true);
    try {
      // Отправляем на бэкенд (роут /auth/avatar мы создали ранее)
      const res = await api.post("/auth/avatar", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const updatedUser = res.data.user;
      setProfile(updatedUser); // Обновляем локально
      setUser(updatedUser);    // Обновляем в AuthContext (для хедера)
      alert("Аватар успешно обновлен!");
    } catch (err) { 
      console.error(err);
      alert("Ошибка при загрузке фото"); 
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await api.put("/auth/profile", formData);
      const updatedUser = res.data.user || { ...profile, ...formData };
      setProfile(updatedUser);
      setUser(updatedUser); // Синхронизируем имя/фамилию с контекстом
      setIsEditing(false);
      alert("Профиль обновлен!");
    } catch (err) { 
      alert("Ошибка при сохранении данных"); 
    }
  };

  if (loading) return <div style={{padding: '100px', textAlign: 'center', color: '#fff'}}>Loading profile data...</div>;
  if (!profile) return <div style={{padding: '100px', textAlign: 'center', color: '#fff'}}>User not found</div>;

  return (
    <div style={{ padding: '40px 0', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.02)', 
        borderRadius: '32px', 
        padding: '40px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        
        {/* АВАТАР И ХЕДЕР */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '40px', 
              background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '40px', fontWeight: '800', color: '#000', overflow: 'hidden',
              opacity: uploading ? 0.5 : 1, transition: '0.3s'
            }}>
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl?.startsWith('http') ? profile.avatarUrl : `${apiUrl}${profile.avatarUrl}`}
                  alt="avatar" 
                  style={{width:'100%', height:'100%', objectFit:'cover'}} 
                />
              ) : (
                (profile.firstName ? profile.firstName[0].toUpperCase() : profile.username?.[0].toUpperCase() || "?")
              )}
            </div>
            
            {/* Кнопка смены аватара */}
            <label style={{ 
              position: 'absolute', bottom: '-5px', right: '-5px', 
              background: '#fff', width: '34px', height: '34px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              cursor: uploading ? 'default' : 'pointer', border: '3px solid #0a0a0a',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              {uploading ? "..." : "📷"} 
              <input 
                type="file" 
                style={{display:'none'}} 
                onChange={handleAvatarChange} 
                accept="image/*"
                disabled={uploading}
              />
            </label>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#fff' }}>
              {profile.firstName || "User"} {profile.lastName || ""}
            </h1>
            <p style={{ color: '#10b981', margin: '4px 0', fontWeight: '600' }}>@{profile.username || "username"}</p>
            <p style={{ color: '#444', fontSize: '12px', margin: 0 }}>Role: {profile.role}</p>
          </div>
        </div>

        {/* ФОРМА С ДАННЫМИ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{fontSize: '11px', color: '#444', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px'}}>Email Address</label>
            <div style={{padding: '16px', background: '#000', borderRadius: '14px', border: '1px solid #1a1a1a', color: '#444', fontSize: '15px'}}>
              {profile.email} <span style={{fontSize: '10px'}}>(readonly)</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{fontSize: '11px', color: '#444', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px'}}>Phone Number</label>
            {isEditing ? (
              <input 
                className="input" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                style={{background:'#000', border: '1px solid #333', padding: '16px'}} 
                placeholder="Not set"
              />
            ) : (
              <div style={{padding: '16px', background: '#000', borderRadius: '14px', border: '1px solid #1a1a1a', color: '#fff', fontSize: '15px'}}>
                {profile.phone || "Not set"}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{fontSize: '11px', color: '#444', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px'}}>First Name</label>
            {isEditing ? (
              <input 
                className="input" 
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})} 
                style={{background:'#000', border: '1px solid #333', padding: '16px'}} 
              />
            ) : (
              <div style={{padding: '16px', background: '#000', borderRadius: '14px', border: '1px solid #1a1a1a', color: '#fff', fontSize: '15px'}}>
                {profile.firstName || "Not set"}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{fontSize: '11px', color: '#444', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px'}}>Last Name</label>
            {isEditing ? (
              <input 
                className="input" 
                value={formData.lastName} 
                onChange={e => setFormData({...formData, lastName: e.target.value})} 
                style={{background:'#000', border: '1px solid #333', padding: '16px'}} 
              />
            ) : (
              <div style={{padding: '16px', background: '#000', borderRadius: '14px', border: '1px solid #1a1a1a', color: '#fff', fontSize: '15px'}}>
                {profile.lastName || "Not set"}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', gap: '12px' }}>
          <button 
            onClick={isEditing ? handleUpdate : () => setIsEditing(true)} 
            className="btn btnPrimary" 
            style={{ padding: '14px 40px', borderRadius: '14px', fontWeight: '700' }}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
          
          {isEditing && (
            <button 
              onClick={() => setIsEditing(false)} 
              className="btn" 
              style={{ padding: '14px 40px', borderRadius: '14px', background: 'transparent', border: '1px solid #222', color: '#666' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}