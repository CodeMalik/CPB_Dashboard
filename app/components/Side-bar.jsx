"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BoxIcon,
  LayoutDashboard,
  Bolt,
  Package,
  ShoppingBag,
  NotepadText,
  UserPlus,
  LogOut,
  ArrowRightLeft,
  UserCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// This is sample data.
const data = {
  navMain: [
    {
      items: [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          url: "/dashboard",
        },
        {
          title: "Website Metadata's",
          icon: Bolt,
          url: "/metadata",
        },
        {
          title: "Categories",
          icon: Package,
          url: "/categories",
        },
        {
          title: "Products",
          icon: ShoppingBag,
          url: "/products",
        },
        {
          title: "Blogs",
          icon: NotepadText,
          url: "/blogs",
          isActive: false, // Corrected from true to false for default state
        },
        {
          title: "Redirections",
          icon: ArrowRightLeft,
          url: "/redirections",
        },
        {
          title: "Visitors",
          icon: UserCheck ,
          url: "/visitors",
        },
      ],
    },
  ],
};

export default function AppSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null; // Or a loading spinner
  }

  const user = session?.user;
  const isSuperAdmin = user?.role === "superAdmin";

  return (
    <Sidebar>
      <SidebarHeader className={"py-6 px-3 bg-gray-50 border-b"}>
        <div className="flex items-center gap-2 ">
          <BoxIcon className="w-6 h-6" />
          <h1 className="text-xl font-semibold">Admin</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className={"bg-gray-100 flex flex-col justify-between"}>
        <SidebarMenu>
          {data.navMain.map((item, index) => (
            <SidebarGroup key={index}>
              <SidebarGroupContent className={"!p-0"}>
                <SidebarMenu>
                  {item.items.map((item, index) => {
                    let Icon = item.icon;
                    return (
                      <SidebarMenuItem key={index}>
                        <SidebarMenuButton asChild isActive={item.isActive}>
                          <Link
                            href={item.url}
                            passHref
                            className={` hover:!bg-gray-200 hover:text-black text-black/80 ${
                              pathname === item.url ? "bg-gray-200 text-black font-semibold" : ""
                            }`}
                            
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  {isSuperAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          href="/admin"
                          passHref
                          className="w-full flex items-center gap-2"
                        >
                          <UserPlus className="w-5 h-5" />
                          <span>Create Admin</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarMenu>

        <SidebarFooter className="p-3 border-t">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.image || ""} alt="user avatar" />
              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{user?.name}</span>
              <span className="text-xs text-gray-500">{user?.email}</span>
            </div>
          </div>
          <SidebarMenuButton
            onClick={() => signOut()}
            className="mt-4 w-full justify-center cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </SidebarMenuButton>
        </SidebarFooter>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}