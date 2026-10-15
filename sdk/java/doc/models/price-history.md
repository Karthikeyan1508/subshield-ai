
# Price History

## Structure

`PriceHistory`

## Fields

| Name | Type | Tags | Description | Getter | Setter |
|  --- | --- | --- | --- | --- | --- |
| `At` | `LocalDateTime` | Required | - | LocalDateTime getAt() | setAt(LocalDateTime at) |
| `Price` | `double` | Required | - | double getPrice() | setPrice(double price) |

## Example

```java
import localhost4000.DateTimeHelper;
import localhost4000.models.PriceHistory;

PriceHistory priceHistory = new PriceHistory.Builder(
    DateTimeHelper.fromRfc8601DateTime("2016-03-13T12:52:32.123Z"),
    125.56D
)
.build();
```

