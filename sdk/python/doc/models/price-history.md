
# Price History

## Structure

`PriceHistory`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `at` | `datetime` | Required | - |
| `price` | `float` | Required | - |

## Example

```python
import dateutil.parser

from subshieldaiapi.models.price_history import PriceHistory

price_history = PriceHistory(
    at=dateutil.parser.parse('2016-03-13T12:52:32.123Z'),
    price=131.32
)
```

