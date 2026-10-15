
# Subscription

## Structure

`Subscription`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `str` | Required | - |
| `merchant` | `str` | Required | - |
| `status` | `str` | Required | PayPal status |
| `price` | `float` | Optional | - |
| `currency` | `str` | Optional | - |
| `interval` | `str` | Optional | - |
| `next_billing_time` | `datetime` | Optional | Next charge, or the expected first charge while approval is pending |
| `trial_ends_at` | `datetime` | Optional | - |
| `approve_url` | `str` | Optional | Buyer approval link, only while APPROVAL_PENDING |
| `price_history` | [`List[PriceHistory]`](../../doc/models/price-history.md) | Required | - |
| `hike` | [`Hike`](../../doc/models/hike.md) | Required | - |
| `predatory_score` | `int` | Required | **Constraints**: `>= 0`, `<= 100` |

## Example

```python
import dateutil.parser

from subshieldaiapi.models.hike import Hike
from subshieldaiapi.models.price_history import PriceHistory
from subshieldaiapi.models.subscription import Subscription

subscription = Subscription(
    id='id4',
    merchant='merchant0',
    status='APPROVAL_PENDING',
    price_history=[
        PriceHistory(
            at=dateutil.parser.parse('2016-03-13T12:52:32.123Z'),
            price=125.56
        )
    ],
    hike=Hike(
        mfrom=120.78,
        to=100.18,
        pct=78
    ),
    predatory_score=100,
    price=131.92,
    currency='USD',
    interval='1 MONTH',
    next_billing_time=dateutil.parser.parse('2016-03-13T12:52:32.123Z'),
    trial_ends_at=dateutil.parser.parse('2016-03-13T12:52:32.123Z')
)
```

