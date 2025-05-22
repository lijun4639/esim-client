import { LineLoading } from "@/components/loading";
import DashboardLayout from "@/layouts/dashboard";
import AuthGuard from "@/routes/components/auth-guard";
import { Suspense, lazy } from "react";
import type { RouteObject } from "react-router";
import { Navigate } from "react-router";

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;

// dashboard
const WorkbenchPage = lazy(() => import("@/pages/dashboard/workbench"));
const AnalysisPage = lazy(() => import("@/pages/dashboard/analysis"));

// message
const ChatPage = lazy(() => import("@/pages/message/chat"));
const BulkTasksPage = lazy(() => import("@/pages/message/bulk-tasks"));

// template
const TemplateContentPage = lazy(() => import("@/pages/template/content"));
const TemplateGroupPage = lazy(() => import("@/pages/template/group"));

// custom components
const AnimatePage = lazy(() => import("@/pages/components/animate"));
const ScrollPage = lazy(() => import("@/pages/components/scroll"));
const MultiLanguagePage = lazy(() => import("@/pages/components/multi-language"));
const IconPage = lazy(() => import("@/pages/components/icon"));
const UploadPage = lazy(() => import("@/pages/components/upload"));
const ChartPage = lazy(() => import("@/pages/components/chart"));
const ToastPage = lazy(() => import("@/pages/components/toast"));
const ClipboardPage = lazy(() => import("@/pages/functions/clipboard"));
const TokenExpiredPage = lazy(() => import("@/pages/functions/token-expired"));

// error
const Page403 = lazy(() => import("@/pages/sys/error/Page403"));
const Page404 = lazy(() => import("@/pages/sys/error/Page404"));
const Page500 = lazy(() => import("@/pages/sys/error/Page500"));

// management
const ProfilePage = lazy(() => import("@/pages/management/user/profile"));
const AccountPage = lazy(() => import("@/pages/management/user/account"));
const OrganizationPage = lazy(() => import("@/pages/management/system/organization"));
const PermissioPage = lazy(() => import("@/pages/management/system/permission"));
const RolePage = lazy(() => import("@/pages/management/system/role"));
const UserPage = lazy(() => import("@/pages/management/system/user"));

// others
const ExternalLink = lazy(() => import("@/pages/sys/others/iframe/external-link"));
const Iframe = lazy(() => import("@/pages/sys/others/iframe"));
const Calendar = lazy(() => import("@/pages/sys/others/calendar"));
const Kanban = lazy(() => import("@/pages/sys/others/kanban"));
const Blank = lazy(() => import("@/pages/sys/others/blank"));

export const dashboardRoutes: RouteObject[] = [
	{
		path: "/",
		element: (
			<AuthGuard>
				<Suspense fallback={<LineLoading />}>
					{/* outlet inside DashboardLayout */}
					<DashboardLayout />
				</Suspense>
			</AuthGuard>
		),
		children: [
			{ index: true, element: <Navigate to={HOMEPAGE} replace /> },
			{
				path: "dashboard",
				children: [
					{ index: true, element: <WorkbenchPage /> },
					{ path: "workbench", element: <WorkbenchPage /> },
					{ path: "analysis", element: <AnalysisPage /> },
				],
			},
			{
				path: "message",
				children: [
					{ index: true, element: <ChatPage /> },
					{ path: "chat", element: <ChatPage /> },
					{ path: "bulk-tasks", element: <BulkTasksPage /> },
				],
			},
			{
				path: "template",
				children: [
					{ index: true, element: <TemplateGroupPage /> },
					{ path: "group", element: <TemplateGroupPage /> },
					{ path: "content", element: <TemplateContentPage /> },
				],
			},
			{
				path: "components",
				children: [
					{ index: true, element: <AnimatePage /> },
					{ path: "animate", element: <AnimatePage /> },
					{ path: "scroll", element: <ScrollPage /> },
					{ path: "multi-language", element: <MultiLanguagePage /> },
					{ path: "icon", element: <IconPage /> },
					{ path: "upload", element: <UploadPage /> },
					{ path: "chart", element: <ChartPage /> },
					{ path: "toast", element: <ToastPage /> },
				],
			},
			{
				path: "functions",
				children: [
					{ index: true, element: <Navigate to="clipboard" replace /> },
					{ path: "clipboard", element: <ClipboardPage /> },
					{ path: "token-expired", element: <TokenExpiredPage /> },
				],
			},
			{
				path: "management",
				children: [
					{ index: true, element: <Navigate to="user" replace /> },
					{
						path: "user",
						children: [
							{ index: true, element: <Navigate to="profile" replace /> },
							{ path: "profile", element: <ProfilePage /> },
							{ path: "account", element: <AccountPage /> },
						],
					},
					{
						path: "system",
						children: [
							{ index: true, element: <Navigate to="organization" replace /> },
							{ path: "organization", element: <OrganizationPage /> },
							{ path: "permission", element: <PermissioPage /> },
							{ path: "role", element: <RolePage /> },
							{ path: "user", element: <UserPage /> },
						],
					},
				],
			},
			{
				path: "error",
				children: [
					{ index: true, element: <Navigate to="403" replace /> },
					{ path: "403", element: <Page403 /> },
					{ path: "404", element: <Page404 /> },
					{ path: "500", element: <Page500 /> },
				],
			},
			{
				path: "iframe",
				children: [
					{ index: true, element: <Navigate to="iframe" replace /> },
					{ path: "iframe", element: <Iframe src="https://ant.design/index-cn" /> },
					{ path: "external-link", element: <ExternalLink src="https://ant.design/index-cn" /> },
				],
			},
			{ path: "calendar", element: <Calendar /> },
			{ path: "kanban", element: <Kanban /> },
			{ path: "blank", element: <Blank /> },
		],
	},
];
