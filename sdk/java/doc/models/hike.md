
# Hike

## Structure

`Hike`

## Fields

| Name | Type | Tags | Description | Getter | Setter |
|  --- | --- | --- | --- | --- | --- |
| `From` | `double` | Required | - | double getFrom() | setFrom(double from) |
| `To` | `double` | Required | - | double getTo() | setTo(double to) |
| `Pct` | `int` | Required | Percent increase, rounded | int getPct() | setPct(int pct) |

## Example

```java
import com.onrender.subshieldapi.models.Hike;

Hike hike = new Hike.Builder(
    120.78D,
    100.18D,
    78
)
.build();
```

