
# Subscription

## Structure

`Subscription`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string` | Required | - |
| `merchant` | `string` | Required | - |
| `status` | `string` | Required | PayPal status |
| `price` | `number \| null \| undefined` | Optional | - |
| `currency` | `string \| null \| undefined` | Optional | - |
| `interval` | `string \| null \| undefined` | Optional | - |
| `nextBillingTime` | `string \| null \| undefined` | Optional | Next charge, or the expected first charge while approval is pending |
| `trialEndsAt` | `string \| null \| undefined` | Optional | - |
| `approveUrl` | `string \| null \| undefined` | Optional | Buyer approval link, only while APPROVAL_PENDING |
| `priceHistory` | [`PriceHistory[]`](../../doc/models/price-history.md) | Required | - |
| `hike` | [`Hike \| null`](../../doc/models/hike.md) | Required | - |
| `predatoryScore` | `number` | Required | **Constraints**: `>= 0`, `<= 100` |

## Example

```ts
import { Subscription } from 'subshield-ai-apilib';

const subscription: Subscription = {
  id: 'id4',
  merchant: 'merchant0',
  status: 'APPROVAL_PENDING',
  priceHistory: [
    {
      at: '2016-03-13T12:52:32.123Z',
      price: 125.56,
    }
  ],
  hike: {
    from: 120.78,
    to: 100.18,
    pct: 78,
  },
  predatoryScore: 100,
  price: 131.92,
  currency: 'USD',
  interval: '1 MONTH',
  nextBillingTime: '2016-03-13T12:52:32.123Z',
  trialEndsAt: '2016-03-13T12:52:32.123Z',
};
```

