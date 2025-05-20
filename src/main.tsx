import "./global.css";
import "./theme/theme.css";
import "./locales/i18n";

import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet, RouterProvider, createHashRouter } from "react-router";
import App from "./App";
import { registerLocalIcons } from "./components/icon";
import PageError from "./pages/sys/error/PageError";
import { routesSection } from "./routes/sections";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// 设置全局默认时区为北京时间
dayjs.tz.setDefault('Asia/Shanghai');

await registerLocalIcons();


const router = createHashRouter([
	{
		Component: () => (
			<App>
				<Outlet />
			</App>
		),
		errorElement: <ErrorBoundary fallbackRender={PageError} />,
		children: routesSection,
	},
]);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<RouterProvider router={router} />);
