// "use client"
// import React, { useState } from 'react';
// import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
// import type { MenuProps } from 'antd';
// import { Menu } from 'antd';
// import { Divider } from 'antd';


// type MenuItem = Required<MenuProps>['items'][number];

// const items: MenuItem[] = [
//   {
//     key: '1',
//     icon: <MailOutlined />,
//     label: 'All certifications',
    
//   },
//   {
//     key: '2',
//     icon: <AppstoreOutlined />,
//     label: 'User Suggested Certifications',
   
//   },
//   {
//     key: '3',
//     icon: <SettingOutlined />,
//     label: 'Users & Roles',
    
//   },
  
//   {
//     key: '4',
//     icon: <SettingOutlined />,
//     label: 'Critical certifications',
    
//   },
  
// ];

// interface LevelKeysProps {
//   key?: string;
//   children?: LevelKeysProps[];
// }

// const getLevelKeys = (items1: LevelKeysProps[]) => {
//   const key: Record<string, number> = {};
//   const func = (items2: LevelKeysProps[], level = 1) => {
//     items2.forEach((item) => {
//       if (item.key) {
//         key[item.key] = level;
//       }
//       if (item.children) {
//         func(item.children, level + 1);
//       }
//     });
//   };
//   func(items1);
//   return key;
// };

// const levelKeys = getLevelKeys(items as LevelKeysProps[]);

// const App: React.FC = () => {
//   const [stateOpenKeys, setStateOpenKeys] = useState(['2', '23']);

//   const onOpenChange: MenuProps['onOpenChange'] = (openKeys) => {
//     const currentOpenKey = openKeys.find((key) => stateOpenKeys.indexOf(key) === -1);
//     // open
//     if (currentOpenKey !== undefined) {
//       const repeatIndex = openKeys
//         .filter((key) => key !== currentOpenKey)
//         .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

//       setStateOpenKeys(
//         openKeys
//           // remove repeat key
//           .filter((_, index) => index !== repeatIndex)
//           // remove current level all child
//           .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
//       );
//     } else {
//       // close
//       setStateOpenKeys(openKeys);
//     }
//   };

//   return (
//     <div>
//         {/* <Divider className='w-fit'/>  */}
//     <Menu className='h-screen bg-whitegrey'
//       mode="inline"
//       defaultSelectedKeys={['231']}
//       openKeys={stateOpenKeys}
//       onOpenChange={onOpenChange}
//       style={{ width: 256 }}
//       items={items}
//     />
//     </div>
//   );
// };

// export default App;

// components/MenuBar.js

// "use client"
// import { useState } from "react";
// import Link from "next/link";

// export default function MenuBar() {
//   const [activeTab, setActiveTab] = useState("Overview");

//   const tabs = ["Overview", "Analytics", "Reports", "Notifications"];

//   return (
//     <nav className="bg-white p-2">
//       <ul className="flex space-x-4">
//         {tabs.map((tab) => (
//           <li key={tab}>
//             <button
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 rounded ${
//                 activeTab === tab
//                   ? "bg-white text-black font-semibold"
//                   : "text-gray-400 hover:text-black"
//               }`}
//             >
//               {tab}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </nav>
//   );
// }



"use client";
import { useState } from "react";
import Link from "next/link";
import SpinnerComponent from "./spinnercomponent";


export default function MenuBar() {
  const [activeTab, setActiveTab] = useState("Overview");

  // Define tabs and their corresponding routes
  const tabs = [
    { name: "Overview", route: "/" },
    { name: "Reports", route: "/reports" },
    { name: "Cost Analytics", route: "/costanalytics" },
    { name: "Notifications", route: "/notifications" },
  ];

  return (
    <nav className="bg-white p-2">
      <ul className="flex space-x-4">
        {tabs.map((tab) => (
          <li key={tab.name}>
            <Link href={tab.route} passHref>
              <button
                onClick={() => setActiveTab(tab.name)}
                className={`px-4 py-2 rounded ${
                  activeTab === tab.name
                    ? "bg-white text-black font-semibold"
                    : "text-gray-400 hover:text-black"
                }`}
              >
                {tab.name}
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
