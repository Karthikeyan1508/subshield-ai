
# Hike

## Structure

`Hike`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `mfrom` | `float` | Required | - |
| `to` | `float` | Required | - |
| `pct` | `int` | Required | Percent increase, rounded |

## Example

```python
from subshieldaiapi.models.hike import Hike

hike = Hike(
    mfrom=120.78,
    to=100.18,
    pct=78
)
```

