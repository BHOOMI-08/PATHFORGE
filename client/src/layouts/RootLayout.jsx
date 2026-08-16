import { Outlet } from "react-router-dom";
const RootLayout = () => {
  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 font-sans selection:bg-[#34D399]/30 selection:text-white">
      <Outlet />
    </div>
  );
};

export default RootLayout;
