# Plan-specific checkout discounts

## Configure in the admin dashboard

1. Create the discount in the intended Polar organization/environment. It must have a discount **code** (not a checkout URL or a discount UUID).
2. Open **Plugins & payments → Credentials & plugin settings**, choose **Live payments** or **Sandbox testing**, and select the plugin.
3. Beside **Shared Pro benefit UUID**, enter **Polar discount code** and check the eligible plans: **Monthly**, **Yearly**, and/or **Lifetime**.
4. Click **Validate & publish**. For an enabled payment environment/plugin, publication validates that the code resolves uniquely in that organization, is currently active, has redemptions remaining, and permits every checked product.
5. To stop automatic application, clear the code and uncheck every plan, then publish.

One code can be shared by any combination of the plugin's three plans. Each plugin/environment has independent settings, stored in the existing `plugin_control.settings` JSON and covered by the normal revision/audit/undo flow. No database migration or new environment variables are needed.

Changes affect new billing requests. For existing sessions use **Start new Pro checkout** when prompted; old provider checkout URLs are not remotely revoked by changing dashboard settings. To revoke a promotion everywhere, also disable/update the discount in Polar.

## Checkout behavior

- `/api/billing/checkout` creates an account-linked URL for **one selected product**, never a multi-product plan selector. The client supplies only its selected `cadence`, request UUID, and optional explicit replacement flag. For backwards compatibility, requests without a cadence retain the existing Lifetime default.
- There is no need to paste static checkout links into the plugin. Each plan gets its own runtime-generated, customer-linked checkout. Do not replace this with a public shared checkout link: purchases need their account and Framer-site bindings for access, upgrades, and refunds.
- The server resolves the configured code through the current environment's Polar API and sends its `discount_id` to checkout creation only for checked plans. Browser-supplied discount codes/IDs, prices, or account identities do not override dashboard configuration.
- Checked plans with an expired, exhausted, ambiguous, wrongly restricted, or otherwise unverifiable code fail with an actionable error rather than silently opening a full-price checkout.
- Old open checkouts are reused only when both their product and discount still match. A changed/removed code or different plan triggers the existing deliberate replacement flow.
- Customers can still enter other eligible discount codes in Polar where Polar permits it. The checkboxes control the code Qubtic automatically applies, not the provider's separate manual-code rules.
- **Coupons do not stack with earned Monthly → Yearly proration credit.** Polar accepts one checkout discount. If both would apply, Qubtic blocks the checkout and directs the customer to billing support rather than silently discarding either credit. Lifetime unused-time refunds remain a separate post-payment process and can coexist with a Lifetime promotion.

The server token needs `discounts:read` to validate existing codes. Existing automatic proration also needs `discounts:write`. Publication and checkout do not create or duplicate Polar products.

## Telegram Commerce

The existing Lifetime-only offer is preserved. Its purchase request explicitly selects Lifetime, and the server applies the dashboard code only if **Lifetime** is checked. Other apps/clients selecting Monthly or Yearly get separate checkouts for those products.

The catalog response reads the current Polar product price and returns `price_amount`, `discount_amount`, `amount_due`, and `currency` in integer minor units, plus the configured discount code and duration when applicable. Telegram displays the real full price without a code, or the original price, discounted amount, and savings with a code. For recurring plans, once-only and repeating discounts are identified rather than advertised as permanent. Taxes and customer-specific eligibility are confirmed by Polar at checkout; the displayed quote is not a tax-inclusive final total. Products with ambiguous multi-currency/variable pricing or unverifiable discounts are marked unavailable, never given a guessed price. **Refresh billing** reloads current prices and settings.

The normal “Checkout tab opened in Polar” card has been removed. Purchase Pro still opens checkout directly; only an actually blocked popup displays a small recovery link.

Deploy the updated site code, rebuild/reinstall Telegram Commerce for its updated display, and publish the desired dashboard settings. Existing applications using the shared checkout API receive the server-side policy without their own discount implementation.

## Validation

```sh
npm run typecheck
npm test
```

API/unit tests cover plan-specific settings, validation/publication, single-product selection, client override rejection, removed-code recovery, and proration conflicts. Telegram browser tests mock Polar and verify that only the selected plan's code is shown and no coupon is supplied by the client. No real checkout/payment or live Polar setting is changed by these tests.
