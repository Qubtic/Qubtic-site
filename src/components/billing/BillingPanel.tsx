import { useEffect, useRef, useState } from "react";
import "./billing-panel.css";

const API = "https://www.qubtic.tech/api/billing";
type Cadence = "monthly" | "yearly" | "lifetime";

interface Order {
	polar_order_id: string;
	cadence: Cadence;
	status: string;
	amount: number;
	subtotal_amount: number;
	discount_amount: number;
	refunded_amount: number;
	currency: string;
	purchased_at: string;
}

interface Plan {
	cadence: Cadence;
}

interface Status {
	upgrade_refunds?: {
		id: string;
		status: "pending" | "completed" | "manual_review";
		amount?: number;
		currency?: string;
	}[];
	is_pro: boolean;
	orders: Order[];
	subscriptions: {
		cadence: string;
		status: string;
		current_period_end: string;
		cancel_at_period_end: boolean;
	}[];
}

function money(amount: number, currency: string) {
	if (!Number.isFinite(amount) || !currency || !/^[A-Z]{3}$/i.test(currency))
		return "Price at checkout";
	try {
		const formatter = new Intl.NumberFormat(undefined, {
			style: "currency",
			currency: currency.toUpperCase(),
		});
		const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
		return formatter.format(amount / 10 ** digits);
	} catch {
		return "Price at checkout";
	}
}

function safeUUID(): string {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		try {
			return crypto.randomUUID();
		} catch {
			/* fallback below */
		}
	}
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
	});
}

export function BillingPanel({
	token,
	onVerified,
}: {
	token: string;
	onVerified?: (pro: boolean) => void;
}) {
	const [plans, setPlans] = useState<Plan[]>([]);
	const [status, setStatus] = useState<Status | null>(null);
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);
	const [cancelBusy, setCancelBusy] = useState(false);
	const [confirmingCancel, setConfirmingCancel] = useState(false);
	const [feedbackMessage, setFeedbackMessage] = useState("");
	const [pending, setPending] = useState(false);
	const [destination, setDestination] = useState("");
	const [destinationAction, setDestinationAction] = useState<
		"checkout" | "portal" | null
	>(null);
	const [previousUrl, setPreviousUrl] = useState("");
	const [selectedCadence, setSelectedCadence] = useState<Cadence>("yearly");

	const callback = useRef(onVerified);
	callback.current = onVerified;
	const running = useRef(false);
	const currentToken = useRef(token);
	currentToken.current = token;

	async function api(action: string, body?: unknown) {
		const response = await fetch(`${API}/${action}`, {
			method: body === undefined ? "GET" : "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				...(body === undefined ? {} : { "Content-Type": "application/json" }),
			},
			...(body === undefined ? {} : { body: JSON.stringify(body) }),
			cache: "no-store",
			signal: AbortSignal.timeout(25000),
		});
		const data = await response.json();
		if (!response.ok) {
			throw Object.assign(
				new Error(data.error || "Billing is unavailable. Please try again."),
				{
					previous_url: data.previous_url,
				},
			);
		}
		return data;
	}

	useEffect(() => {
		setStatus(null);
		setPlans([]);
		setPending(false);
		setDestination("");
		setDestinationAction(null);
		setPreviousUrl("");
		setConfirmingCancel(false);
		setFeedbackMessage("");
		if (!token) return;
		let active = true;
		Promise.all([api("catalog"), api("status")])
			.then(([catalog, next]) => {
				if (active) {
					setPlans(catalog.plans);
					setStatus(next);
					if (next.is_pro) {
						const activeSub = next.subscriptions?.find(
							(s: any) =>
								s.status === "active" &&
								Date.parse(s.current_period_end) > Date.now(),
						);
						const hasLife = next.orders?.some(
							(o: any) =>
								o.cadence === "lifetime" &&
								["paid", "partially_refunded"].includes(o.status) &&
								o.amount > o.refunded_amount,
						);
						const activeCadence = hasLife
							? "lifetime"
							: (activeSub?.cadence as Cadence) ||
								(next.orders?.[0]?.cadence as Cadence);
						if (activeCadence) setSelectedCadence(activeCadence);
					}
					setError("");
					callback.current?.(next.is_pro === true);
				}
			})
			.catch((err) => {
				if (active) setError(err.message);
			});
		return () => {
			active = false;
		};
	}, [token]);

	async function refresh() {
		if (!token || running.current) return;
		running.current = true;
		setBusy(true);
		try {
			await api("refresh", {});
			const next = await api("status");
			if (currentToken.current !== token) return;
			setStatus(next);
			callback.current?.(next.is_pro === true);
			setError("");
			if (next.is_pro) setPending(false);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Could not refresh billing.",
			);
		} finally {
			running.current = false;
			setBusy(false);
		}
	}

	useEffect(() => {
		if (!token) return;
		const focus = () => {
			void refresh();
		};
		window.addEventListener("focus", focus);
		let count = 0;
		const timer = pending
			? setInterval(() => {
					if (++count > 8) {
						setPending(false);
						return;
					}
					void refresh();
				}, 15000)
			: undefined;
		return () => {
			window.removeEventListener("focus", focus);
			if (timer) clearInterval(timer);
		};
	}, [pending, token]);

	async function open(action: "checkout" | "portal", replacePrevious = false) {
		const channel = safeUUID();
		let launcher: Window | null = null;
		if (action === "checkout") {
			try {
				launcher = window.open(
					`https://www.qubtic.tech/billing/launch#${channel}`,
					"_blank",
				);
			} catch {
				/* The checkout link remains available after the request. */
			}
		}
		setBusy(true);
		setError("");
		setDestination("");
		setDestinationAction(null);
		setPreviousUrl("");
		try {
			const data = await api(
				action,
				action === "checkout"
					? {
							cadence: selectedCadence,
							request_id: channel,
							...(replacePrevious ? { replace_previous: true } : {}),
						}
					: {},
			);
			const url = new URL(data.url);
			if (
				url.protocol !== "https:" ||
				![
					"polar.sh",
					"buy.polar.sh",
					"sandbox.polar.sh",
					"sandbox-api.polar.sh",
					"api.polar.sh",
					"sandbox.buy.polar.sh",
				].includes(url.hostname) ||
				url.username ||
				url.password
			) {
				throw new Error("Invalid billing destination.");
			}
			setDestination(url.href);
			setDestinationAction(action);
			if (action === "checkout" && launcher) {
				const target = launcher;
				try {
					if (!target.closed) {
						target.location.href = url.href;
					}
				} catch {
					/* Handled by postMessage bridge or manual link */
				}
				let attempts = 0;
				const timer = window.setInterval(() => {
					if (target.closed || ++attempts > 8) {
						window.clearInterval(timer);
						return;
					}
					try {
						target.postMessage(
							{ type: "qubtic-billing-checkout", channel, url: url.href },
							"*",
						);
					} catch {
						/* Handled once target navigates to Polar */
					}
				}, 250);
			} else if (action === "portal") {
				try {
					window.open(url.href, "_blank", "noopener,noreferrer");
				} catch {
					/* The visible portal link remains available. */
				}
			}
			if (action === "checkout") setPending(true);
		} catch (err) {
			launcher?.close();
			const previous = (err as Error & { previous_url?: string })?.previous_url;
			if (previous) {
				try {
					const url = new URL(previous);
					if (
						url.protocol === "https:" &&
						[
							"polar.sh",
							"buy.polar.sh",
							"sandbox.polar.sh",
							"sandbox-api.polar.sh",
							"api.polar.sh",
							"sandbox.buy.polar.sh",
						].includes(url.hostname) &&
						!url.username &&
						!url.password
					) {
						setPreviousUrl(url.href);
					}
				} catch {
					/* Ignore an invalid recovery link. */
				}
			}
			setError(err instanceof Error ? err.message : "Could not open billing.");
		} finally {
			setBusy(false);
		}
	}

	async function handleCancelSubscription(cancelAtPeriodEnd: boolean) {
		setCancelBusy(true);
		setError("");
		setFeedbackMessage("");
		try {
			const data = await api("cancel", {
				cancel_at_period_end: cancelAtPeriodEnd,
			});
			setConfirmingCancel(false);
			await refresh();
			if (cancelAtPeriodEnd) {
				setFeedbackMessage(
					`Recurring payment is turned off. Pro access remains active until ${new Date(
						data.current_period_end || activeSub?.current_period_end || "",
					).toLocaleDateString()}.`,
				);
			} else {
				setFeedbackMessage(
					"Auto-renewal resumed successfully. Your subscription will renew as scheduled.",
				);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Could not update cancellation status. Please manage in the customer portal.",
			);
		} finally {
			setCancelBusy(false);
		}
	}

	const activeSub = status?.subscriptions?.find(
		(s) =>
			s.status === "active" && Date.parse(s.current_period_end) > Date.now(),
	);
	const hasLifetime = Boolean(
		status?.orders?.some(
			(o) =>
				o.cadence === "lifetime" &&
				["paid", "partially_refunded"].includes(o.status) &&
				o.amount > o.refunded_amount,
		),
	);
	const currentCadence: Cadence | null = status?.is_pro
		? hasLifetime
			? "lifetime"
			: (activeSub?.cadence as Cadence) ||
				(status?.orders?.[0]?.cadence as Cadence) ||
				null
		: null;

	const isCurrentPlan = Boolean(
		status?.is_pro && (selectedCadence === currentCadence || hasLifetime),
	);
	const isUpgradeToYearly = Boolean(
		status?.is_pro &&
		currentCadence === "monthly" &&
		selectedCadence === "yearly",
	);
	const isUpgradeToLifetime = Boolean(
		status?.is_pro &&
		currentCadence !== "lifetime" &&
		selectedCadence === "lifetime",
	);
	const isSwitchToMonthly = Boolean(
		status?.is_pro &&
		currentCadence === "yearly" &&
		selectedCadence === "monthly",
	);

	const remainingMs = activeSub
		? Math.max(0, Date.parse(activeSub.current_period_end) - Date.now())
		: 0;
	const daysRemaining = Math.max(
		0,
		Math.ceil(remainingMs / (24 * 60 * 60 * 1000)),
	);
	const lastMonthlyOrder = status?.orders?.find(
		(o) =>
			o.cadence === "monthly" &&
			["paid", "partially_refunded"].includes(o.status),
	);
	const monthlyPaidAmount = lastMonthlyOrder
		? Math.max(0, lastMonthlyOrder.amount - lastMonthlyOrder.refunded_amount)
		: 500;
	const monthlyTotalMs = 30 * 24 * 60 * 60 * 1000;
	const proratedCreditCents = Math.round(
		monthlyPaidAmount * Math.min(1, remainingMs / monthlyTotalMs),
	);

	async function handlePlanAction() {
		if (!status?.is_pro) {
			await open("checkout");
			return;
		}
		if (isCurrentPlan) return;
		if (isUpgradeToLifetime || isUpgradeToYearly) {
			await open("checkout");
			return;
		}
		if (isSwitchToMonthly) {
			await open("portal");
			return;
		}
		await open("portal");
	}

	const actionButtonText = busy ? (
		<span className="qubtic-btn-spinner-wrap">
			<span className="qubtic-spinner" aria-hidden="true" />
			<span>Preparing checkout…</span>
		</span>
	) : cancelBusy ? (
		<span className="qubtic-btn-spinner-wrap">
			<span className="qubtic-spinner" aria-hidden="true" />
			<span>Updating subscription…</span>
		</span>
	) : !token ? (
		"Sign in to upgrade"
	) : !status?.is_pro ? (
		"Purchase Pro"
	) : hasLifetime ? (
		"✓ Lifetime Pro active"
	) : isCurrentPlan ? (
		`✓ Pro ${currentCadence ? currentCadence.charAt(0).toUpperCase() + currentCadence.slice(1) : ""} active`
	) : isUpgradeToYearly ? (
		"Update to Yearly (Save ~50%)"
	) : isUpgradeToLifetime ? (
		"Upgrade to Lifetime"
	) : isSwitchToMonthly ? (
		"Switch to Monthly in Portal"
	) : (
		"Pro active"
	);

	return (
		<section
			className="qubtic-billing"
			aria-label="Pro billing and purchase history"
		>
			<div className="qubtic-billing-plans">
				<article className="qubtic-billing-plan">
					<div className="qubtic-billing-plan-header">
						<div className="qubtic-billing-title-wrap">
							<h3>Pro access</h3>
							<span className="qubtic-billing-badge">⚡ Instant Unlock</span>
						</div>
						<span className="qubtic-billing-guarantee">
							{status?.is_pro
								? "Active subscription for this site"
								: "14-day refund guarantee"}
						</span>
					</div>

					<p className="qubtic-billing-desc">
						{status?.is_pro
							? "Pro applies to this Framer site. Manage your subscription or switch billing cycles below."
							: "Choose your billing option and enter any eligible discount code at Polar checkout."}
					</p>

					{/* Active Subscription Status Banner for Paid Subscribers */}
					{activeSub && !activeSub.cancel_at_period_end && (
						<div className="qubtic-billing-active-summary">
							<div className="qubtic-billing-active-summary-row">
								<div className="qubtic-billing-status-badge-wrap">
									<span className="qubtic-billing-active-pill">
										Auto-renewal active
									</span>
								</div>
								<span className="qubtic-billing-active-period">
									Renews on{" "}
									{new Date(activeSub.current_period_end).toLocaleDateString()}
								</span>
							</div>
							<p className="qubtic-billing-active-subtext">
								Your plan renews automatically on{" "}
								{new Date(activeSub.current_period_end).toLocaleDateString()}.
								Pro access remains continuously active.
							</p>
							{!confirmingCancel ? (
								<div className="qubtic-billing-active-actions">
									<button
										type="button"
										className="qubtic-billing-cancel-btn"
										disabled={cancelBusy}
										onClick={() => setConfirmingCancel(true)}
									>
										Cancel subscription
									</button>
								</div>
							) : (
								<div className="qubtic-billing-cancel-confirm" role="alert">
									<div className="qubtic-billing-cancel-confirm-header">
										<span
											className="qubtic-billing-cancel-warn"
											aria-hidden="true"
										>
											⚠️
										</span>
										<strong>Cancel recurring renewal?</strong>
									</div>
									<p className="qubtic-billing-cancel-policy">
										<strong>Cancellation policy:</strong> After your current
										subscription period ends on{" "}
										<strong>
											{new Date(
												activeSub.current_period_end,
											).toLocaleDateString()}
										</strong>
										, recurring payments are turned <strong>OFF</strong>. Your
										Pro access remains 100% active until then and you will not
										be billed again.
									</p>
									<div className="qubtic-billing-cancel-actions">
										<button
											type="button"
											className="qubtic-billing-cancel-action-btn"
											disabled={cancelBusy}
											onClick={() => void handleCancelSubscription(true)}
										>
											{cancelBusy
												? "Canceling recurring billing…"
												: "Turn off recurring payment"}
										</button>
										<button
											type="button"
											className="qubtic-billing-cancel-dismiss-btn"
											disabled={cancelBusy}
											onClick={() => setConfirmingCancel(false)}
										>
											Keep Pro subscription
										</button>
									</div>
								</div>
							)}
						</div>
					)}

					{activeSub && activeSub.cancel_at_period_end && (
						<div className="qubtic-billing-cancel-status-banner" role="status">
							<div className="qubtic-billing-cancel-status-header">
								<span className="qubtic-billing-cancel-status-pill">
									Recurring payment OFF
								</span>
							</div>
							<p className="qubtic-billing-cancel-status-text">
								Your subscription is set to cancel. Pro access remains active
								until{" "}
								<strong>
									{new Date(activeSub.current_period_end).toLocaleDateString()}
								</strong>
								. No further charges will occur.
							</p>
							<button
								type="button"
								className="qubtic-billing-resume-btn"
								disabled={cancelBusy}
								onClick={() => void handleCancelSubscription(false)}
							>
								{cancelBusy ? "Resuming…" : "Resume recurring payments"}
							</button>
						</div>
					)}

					{hasLifetime && (
						<div className="qubtic-billing-lifetime-banner">
							<span className="qubtic-billing-lifetime-star" aria-hidden="true">
								★
							</span>
							<div className="qubtic-billing-lifetime-info">
								<strong>Pro Lifetime access unlocked</strong>
								<span>One-time purchase · No recurring charges</span>
							</div>
						</div>
					)}

					{/* Plan Selection Header when Pro is Active */}
					{status?.is_pro && (
						<div className="qubtic-billing-plan-switch-header">
							<span className="qubtic-billing-plan-switch-title">
								Switch or Upgrade Plan
							</span>
							<span className="qubtic-billing-plan-switch-subtitle">
								Update billing cycle to save or get permanent Lifetime access
							</span>
						</div>
					)}

					<div
						className="qubtic-billing-cadences"
						role="radiogroup"
						aria-label="Available billing cadences"
					>
						<button
							type="button"
							className={`qubtic-billing-cadence-pill ${selectedCadence === "monthly" ? "qubtic-billing-cadence-pill--active" : ""}`}
							role="radio"
							aria-checked={selectedCadence === "monthly"}
							onClick={() => setSelectedCadence("monthly")}
						>
							<span className="qubtic-billing-cadence-name">Monthly</span>
							{currentCadence === "monthly" ? (
								<span className="qubtic-billing-cadence-tag">Current</span>
							) : (
								<span className="qubtic-billing-cadence-tag">Flexible</span>
							)}
						</button>
						<button
							type="button"
							className={`qubtic-billing-cadence-pill ${selectedCadence === "yearly" ? "qubtic-billing-cadence-pill--active" : ""}`}
							role="radio"
							aria-checked={selectedCadence === "yearly"}
							onClick={() => setSelectedCadence("yearly")}
						>
							<span className="qubtic-billing-cadence-name">Yearly</span>
							<span className="qubtic-billing-cadence-tag qubtic-billing-cadence-tag--save">
								Save ~50%
							</span>
						</button>
						<button
							type="button"
							className={`qubtic-billing-cadence-pill ${selectedCadence === "lifetime" ? "qubtic-billing-cadence-pill--active" : ""}`}
							role="radio"
							aria-checked={selectedCadence === "lifetime"}
							onClick={() => setSelectedCadence("lifetime")}
						>
							<span className="qubtic-billing-cadence-name">Lifetime</span>
							{currentCadence === "lifetime" ? (
								<span className="qubtic-billing-cadence-tag">Current</span>
							) : (
								<span className="qubtic-billing-cadence-tag">Pay once</span>
							)}
						</button>
					</div>

					<div className="qubtic-billing-cadence-hint">
						<span className="qubtic-billing-hint-bullet">✓</span>
						<span>
							{selectedCadence === "yearly"
								? "Annual billing: Best value for active teams & creators."
								: selectedCadence === "lifetime"
									? "Lifetime access: One-time payment, unlimited future updates."
									: "Monthly billing: Pay as you go, pause or cancel anytime."}
						</span>
					</div>

					{/* Prorated Upgrade or Lifetime Explanations */}
					{isUpgradeToYearly && (
						<div className="qubtic-billing-upgrade-banner" role="status">
							<span className="qubtic-billing-upgrade-icon" aria-hidden="true">
								🏷️
							</span>
							<div className="qubtic-billing-upgrade-info">
								<strong className="qubtic-billing-upgrade-title">
									Automatic proration discount applied
								</strong>
								<span className="qubtic-billing-upgrade-desc">
									{proratedCreditCents > 0
										? `You have ~${daysRemaining} unused days on your monthly plan. A credit of $${(proratedCreditCents / 100).toFixed(2)} will be automatically deducted from your yearly checkout.`
										: "Your upgraded yearly plan will start immediately."}
								</span>
							</div>
						</div>
					)}
					{isUpgradeToLifetime && (
						<div className="qubtic-billing-upgrade-banner" role="status">
							<span className="qubtic-billing-upgrade-icon" aria-hidden="true">
								👑
							</span>
							<div className="qubtic-billing-upgrade-info">
								<strong className="qubtic-billing-upgrade-title">
									Lifetime license
								</strong>
								<span className="qubtic-billing-upgrade-desc">
									One-time payment for permanent access. After confirmed
									payment, previous subscription renewals stop and eligible
									unused subscription time is refunded separately, based on the
									discounted amount paid. Settlement may take time.
								</span>
							</div>
						</div>
					)}

					{/* Perks list: compact strip for active Pro, full list for free users */}
					{status?.is_pro ? (
						<div className="qubtic-billing-active-perks-strip">
							<span className="qubtic-billing-active-perk-item">
								✓ All Pro features &amp; drops
							</span>
							<span className="qubtic-billing-active-perk-item">
								✓ Unlimited personal &amp; client projects
							</span>
							<span className="qubtic-billing-active-perk-item">
								✓ Zero seat restrictions
							</span>
						</div>
					) : (
						<ul className="qubtic-billing-features" role="list">
							<li className="qubtic-billing-feature-item">
								<span className="qubtic-billing-feature-check">✓</span>
								<span>Full access to all Pro features and section drops</span>
							</li>
							<li className="qubtic-billing-feature-item">
								<span className="qubtic-billing-feature-check">✓</span>
								<span>
									Commercial license for unlimited personal &amp; client
									projects
								</span>
							</li>
							<li className="qubtic-billing-feature-item">
								<span className="qubtic-billing-feature-check">✓</span>
								<span>Instant activation &amp; zero seat restrictions</span>
							</li>
						</ul>
					)}

					{status?.upgrade_refunds?.map((refund) => (
						<p
							key={refund.id}
							className="qubtic-billing-feedback-msg"
							role="status"
						>
							{refund.status === "completed"
								? "Unused subscription refund processed; previous subscription auto-renewal is off."
								: refund.status === "manual_review"
									? "Your upgrade needs billing review. Contact Qubtic support to confirm the refund and previous subscription cancellation."
									: "Lifetime upgrade processing: stopping previous subscription renewals and checking the unused-time refund. Settlement may take time."}
						</p>
					))}

					{feedbackMessage && (
						<p className="qubtic-billing-feedback-msg" role="status">
							{feedbackMessage}
						</p>
					)}

					<button
						type="button"
						className={`qubtic-billing-main-btn ${isCurrentPlan ? "qubtic-billing-submit-btn--current" : ""}`}
						disabled={
							!token ||
							busy ||
							cancelBusy ||
							plans.length !== 3 ||
							isCurrentPlan
						}
						onClick={() => void handlePlanAction()}
					>
						{actionButtonText}
					</button>

					{destination && destinationAction === "checkout" && (
						<div className="qubtic-billing-destination-box">
							<div className="qubtic-billing-destination-content">
								<span className="qubtic-billing-destination-icon">🚀</span>
								<div className="qubtic-billing-destination-text">
									<strong>Checkout tab opened in Polar</strong>
									<span>
										If your browser blocked popups, click below to proceed.
									</span>
								</div>
							</div>
							<a
								href={destination}
								target="_blank"
								rel="noopener noreferrer"
								className="qubtic-billing-checkout-link"
							>
								Open Polar checkout
							</a>
						</div>
					)}

					<div className="qubtic-billing-trust">
						<span>🔒 256-bit encrypted checkout</span>
						<span className="qubtic-billing-trust-sep">·</span>
						<span>Powered by Polar</span>
					</div>

					{previousUrl && (
						<div className="qubtic-billing-recovery">
							<div className="qubtic-billing-recovery-header">
								<span className="qubtic-billing-recovery-icon">⚠️</span>
								<span>An earlier checkout is still open</span>
							</div>
							<div className="qubtic-billing-recovery-actions">
								<a
									href={previousUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="qubtic-billing-recovery-link"
								>
									Continue previous checkout
								</a>
								<button
									type="button"
									className="qubtic-billing-recovery-btn"
									disabled={busy}
									onClick={() => void open("checkout", true)}
								>
									Start new Pro checkout
								</button>
							</div>
							<p>
								Close the previous checkout tab before paying to avoid two
								purchases.
							</p>
						</div>
					)}
				</article>
			</div>

			{pending && (
				<p role="status">
					Waiting for payment verification. Access will refresh automatically.
				</p>
			)}
			{error && <p role="alert">{error}</p>}
			{token && (
				<div className="qubtic-billing-actions">
					<button
						type="button"
						className="qubtic-billing-manage-btn"
						disabled={busy || cancelBusy || !status?.orders.length}
						onClick={() => void open("portal")}
					>
						Manage billing &amp; invoices ↗
					</button>
					<button
						type="button"
						className="qubtic-billing-refresh-btn"
						disabled={busy}
						onClick={() => void refresh()}
					>
						{busy ? "Checking billing…" : "Refresh billing"}
					</button>
				</div>
			)}

			{/* Clean Purchase History */}
			<div className="qubtic-billing-history-wrap">
				<div className="qubtic-billing-history-header">
					<h3>Purchase history</h3>
					<span className="qubtic-billing-history-count">
						{status?.orders.length
							? `${status.orders.length} transaction${status.orders.length > 1 ? "s" : ""}`
							: ""}
					</span>
				</div>
				{!status?.orders.length ? (
					<p className="qubtic-billing-history-empty">
						No purchases to display.
					</p>
				) : (
					<ul className="qubtic-billing-history">
						{status.orders.map((order) => (
							<li
								key={order.polar_order_id}
								className="qubtic-billing-history-card"
							>
								<div className="qubtic-billing-history-item-top">
									<span className="qubtic-billing-history-plan-name">
										Pro {order.cadence}
									</span>
									<span className="qubtic-billing-status-pill success">
										{order.status}
									</span>
								</div>
								<div className="qubtic-billing-history-item-meta">
									<span className="qubtic-billing-history-amount">
										{money(order.amount, order.currency)}
									</span>
									<span
										className="qubtic-billing-history-dot"
										aria-hidden="true"
									>
										·
									</span>
									<span className="qubtic-billing-history-date">
										{new Date(order.purchased_at).toLocaleDateString()}
									</span>
								</div>
								{order.discount_amount > 0 && (
									<span className="qubtic-billing-history-discount">
										Discount: {money(order.discount_amount, order.currency)}
									</span>
								)}
								{order.refunded_amount > 0 && (
									<span className="qubtic-billing-history-refund">
										Refund: {money(order.refunded_amount, order.currency)}
									</span>
								)}
							</li>
						))}
					</ul>
				)}
			</div>
		</section>
	);
}
