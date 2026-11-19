import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./components/ui/sidebar";
import { NavLink } from "react-router";
import logoUrl from "./assets/logo.svg";
import {
  House,
  ChartNoAxesCombined,
  SquarePlus,
  ExternalLink,
} from "lucide-react";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: House },
  { title: "Create Payment", url: "/create-payment", icon: SquarePlus },
  { title: "Analytics", url: "/analytics", icon: ChartNoAxesCombined },
  { title: "Payment Links", url: "/payment-links", icon: ExternalLink },
];

interface AppSidebarProps {
  pathname: string;
}

export function AppSidebar({ pathname }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex-row pb-0">
        <div className="payflow-icon-wrapper">
          {/* Imported (not a "/src/..." string) so Vite copies it into the build. */}
          <img className="payflow-icon" src={logoUrl} alt="" />
        </div>

        <div className="header-wrapper">
          <div className="header-text">PayPilot</div>
          <div className="header-description">Payments platform</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="p-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="font-medium"
                >
                  <NavLink to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 flex-row">
        <div className="payflow-icon-wrapper circle-icon">
          <p className="circle-icon-inner">HK</p>
        </div>
        <div className="footer-wrapper">
          <div className="footer-text">Helen Kyryliuk</div>
          <div className="footer-description">helen@paypilot.dev</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
