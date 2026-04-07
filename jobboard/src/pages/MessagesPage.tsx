/* MessagesPage.tsx */
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function MessagesPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [chats, setChats] = useState<any[]>([]); 
  const [currentApp, setCurrentApp] = useState<any>(null); 
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  };

  const fetchChats = async () => {
    try {
      const endpoint = user?.role === 'employer' ? '/applications/owner' : '/applications/my';
      const res = await api.get(endpoint);
      setChats(res.data);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  const fetchCurrentChat = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/applications/${id}`);
      setAppWithScroll(res.data);
    } catch (err) { console.error(err); }
  };

  const setAppWithScroll = (data: any) => {
    const isNewMessage = currentApp?.messages?.length !== data.messages?.length;
    setCurrentApp(data);
    if (isNewMessage) setTimeout(scrollToBottom, 50);
  };

  useEffect(() => { fetchChats(); }, [user]);
  
  useEffect(() => { 
    fetchCurrentChat();
    const interval = setInterval(fetchCurrentChat, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const sendMsg = async () => {
    if (!msg.trim() || !id) return;
    try {
      await api.post(`/applications/${id}/messages`, { text: msg });
      setMsg("");
      fetchCurrentChat();
    } catch (err) { alert("Error sending"); }
  };

  if (loading) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Loading Messenger...</div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', background: '#0a0a0a', overflow: 'hidden' }}>
      
      {/* === ЛЕВАЯ ПАНЕЛЬ (СПИСОК ЧАТОВ) === */}
      <div style={{ width: '350px', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', background: '#0f0f0f', flexShrink: 0 }}>
        <div style={{ padding: '25px', borderBottom: '1px solid #1a1a1a' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Messages</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.map((chat) => {
            const isActive = id === chat.id;
            const isEmployer = user?.role === 'employer';
            
            // Определяем, чьи данные выводить в списке
            const partnerName = isEmployer 
              ? `${chat.candidate?.firstName || ''} ${chat.candidate?.lastName || ''}`.trim() || chat.candidate?.email
              : chat.job?.companyName;
            
            const partnerAvatar = isEmployer ? chat.candidate?.avatarUrl : chat.job?.companyLogo;

            return (
              <div 
                key={chat.id}
                onClick={() => navigate(`/messages/${chat.id}`)}
                style={{ 
                  padding: '20px', cursor: 'pointer', borderBottom: '1px solid #161616',
                  background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  display: 'flex', gap: '15px', alignItems: 'center', transition: 'background 0.2s'
                }}
              >
                {/* АВАТАРКА В СПИСКЕ ЧАТОВ */}
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: isEmployer ? '50%' : '12px', 
                    background: isActive ? '#10b981' : '#222', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden'
                  }}>
                    {partnerAvatar ? (
                      <img src={partnerAvatar?.startsWith('http') ? partnerAvatar : `${apiUrl}${partnerAvatar}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{partnerName?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  {/* Имитация статуса Online */}
                  <div style={{ 
                    position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, 
                    background: isActive ? '#10b981' : '#555', borderRadius: '50%', border: '2px solid #0f0f0f' 
                  }} />
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: '600', color: isActive ? '#10b981' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {partnerName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.job.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* === ПРАВАЯ ПАНЕЛЬ (ОКНО ЧАТА) === */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a', minWidth: 0 }}>
        {currentApp ? (
          <>
            {/* ШАПКА ЧАТА */}
            <div style={{ padding: '15px 30px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
               
               {/* Аватарка в шапке */}
               <div style={{ width: '40px', height: '40px', borderRadius: user?.role === 'employer' ? '50%' : '8px', background: '#222', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {user?.role === 'employer' ? (
                   currentApp.candidate?.avatarUrl ? <img src={currentApp.candidate.avatarUrl?.startsWith('http') ? currentApp.candidate.avatarUrl : `${apiUrl}${currentApp.candidate.avatarUrl}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontWeight:'bold'}}>{currentApp.candidate?.email[0].toUpperCase()}</span>
                 ) : (
                   currentApp.job?.companyLogo ? <img src={currentApp.job.companyLogo?.startsWith('http') ? currentApp.job.companyLogo : `${apiUrl}${currentApp.job.companyLogo}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontWeight:'bold'}}>{currentApp.job?.companyName[0].toUpperCase()}</span>
                 )}
               </div>

               <div>
                 <div style={{ fontWeight: '700', fontSize: '16px' }}>
                   {user?.role === 'employer' 
                     ? `${currentApp.candidate?.firstName || ''} ${currentApp.candidate?.lastName || ''}`.trim() || currentApp.candidate?.email 
                     : currentApp.job.companyName}
                 </div>
                 {/* Заглушка статуса */}
                 <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                   <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }} /> Online
                 </div>
               </div>
            </div>

            {/* ИСТОРИЯ СООБЩЕНИЙ */}
            <div 
              ref={scrollContainerRef}
              style={{ flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <div style={{ alignSelf: 'center', background: '#111', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', color: '#444', marginBottom: '20px', border: '1px solid #1a1a1a' }}>
                Application started on {new Date(currentApp.createdAt).toLocaleDateString()}
              </div>

              {currentApp.messages.map((m: any, index: number) => {
                const isMine = m.senderId === user?.id;
                
                // ЛОГИКА ГРУППИРОВКИ (Telegram-style)
                const prevMsg = index > 0 ? currentApp.messages[index - 1] : null;
                const nextMsg = index < currentApp.messages.length - 1 ? currentApp.messages[index + 1] : null;
                
                const isFirstInGroup = !prevMsg || prevMsg.senderId !== m.senderId;
                const isLastInGroup = !nextMsg || nextMsg.senderId !== m.senderId;
                
                // ЛОГИКА ДАТЫ
                const currentDate = new Date(m.createdAt).toLocaleDateString();
                const prevDate = prevMsg ? new Date(prevMsg.createdAt).toLocaleDateString() : null;
                const showDateLabel = currentDate !== prevDate;

                // Получаем аватарку для сообщения
                let msgAvatar = null;
                let msgInitial = "?";
                if (isMine) {
                  msgAvatar = user?.avatarUrl;
                  msgInitial = user?.username?.[0]?.toUpperCase() || "M";
                } else {
                  msgAvatar = user?.role === 'employer' ? currentApp.candidate?.avatarUrl : currentApp.job?.companyLogo;
                  msgInitial = user?.role === 'employer' ? currentApp.candidate?.email[0].toUpperCase() : currentApp.job?.companyName[0].toUpperCase();
                }

                return (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    {showDateLabel && (
                      <div style={{ alignSelf: 'center', margin: '20px 0', fontSize: '12px', fontWeight: '600', color: '#666', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>
                        {new Date(m.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    
                    <div style={{ 
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '75%', display: 'flex', alignItems: 'flex-end', gap: '10px',
                      marginTop: isFirstInGroup ? '10px' : '0' // Отступ между группами
                    }}>
                      
                      {/* АВАТАРКА СОБЕСЕДНИКА (Слева, только для последнего сообщения в группе) */}
                      {!isMine && (
                        <div style={{ 
                          width: '30px', height: '30px', borderRadius: user?.role === 'employer' ? '50%' : '8px', 
                          background: '#222', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: isLastInGroup ? 1 : 0 // Скрываем, если это не последнее сообщение в блоке
                        }}>
                          {msgAvatar ? <img src={msgAvatar?.startsWith('http') ? msgAvatar : `${apiUrl}${msgAvatar}`} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <span style={{fontSize:'12px', fontWeight:'bold'}}>{msgInitial}</span>}
                        </div>
                      )}

                      {/* ТЕЛО СООБЩЕНИЯ */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          background: isMine ? '#10b981' : '#1a1a1a',
                          color: isMine ? '#000' : '#fff',
                          padding: '12px 16px',
                          borderRadius: '18px',
                          borderTopLeftRadius: !isMine && !isFirstInGroup ? '4px' : '18px',
                          borderBottomLeftRadius: !isMine && !isLastInGroup ? '4px' : (isMine ? '18px' : '4px'),
                          borderTopRightRadius: isMine && !isFirstInGroup ? '4px' : '18px',
                          borderBottomRightRadius: isMine && !isLastInGroup ? '4px' : (isMine ? '4px' : '18px'),
                          fontSize: '15px', fontWeight: isMine ? '600' : '400',
                          wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'
                        }}>
                          {m.text}
                        </div>
                        {/* Время показываем только под последним сообщением в группе */}
                        {isLastInGroup && (
                          <div style={{ fontSize: '10px', color: '#444', marginTop: '4px' }}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>

                      {/* АВАТАРКА ОТПРАВИТЕЛЯ (Справа, только для последнего сообщения в группе) */}
                      {isMine && (
                        <div style={{ 
                          width: '30px', height: '30px', borderRadius: '50%', 
                          background: '#10b981', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: isLastInGroup ? 1 : 0
                        }}>
                           {msgAvatar ? <img src={msgAvatar?.startsWith('http') ? msgAvatar : `${apiUrl}${msgAvatar}`} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <span style={{fontSize:'12px', fontWeight:'bold', color:'#000'}}>{msgInitial}</span>}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>

            {/* ВВОД СООБЩЕНИЯ */}
            <div style={{ padding: '25px 30px', borderTop: '1px solid #1a1a1a' }}>
              <div style={{ display: 'flex', gap: '12px', background: '#111', padding: '10px', borderRadius: '16px', border: '1px solid #222', alignItems: 'flex-end' }}>
                <textarea 
                  value={msg} onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                  placeholder="Type a message..."
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', padding: '8px 10px', resize: 'none', minHeight: '24px', maxHeight: '150px', fontFamily: 'inherit', fontSize: '15px', lineHeight: '1.4' }}
                />
                <button 
                  onClick={sendMsg}
                  style={{ background: '#10b981', border: 'none', width: '60px', height: '40px', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '50px' }}>💬</span>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}