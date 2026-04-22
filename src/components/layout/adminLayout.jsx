// import { useState } from "react";
// import Sidebar from "./sidebar";
// import Header from "./header";

// const AdminLayout = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   return (
//     <div className="flex">
//       <Sidebar isOpen={sidebarOpen} />

//       <div
//         className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300
//         ${sidebarOpen ? "ml-64" : "ml-20"}`}
//       >
//         <Header toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

//         <main className="p-4 md:p-6">{children}</main>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;

import { useState } from "react";
import TopNavbar from "./TopNavbar";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <TopNavbar />

      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
