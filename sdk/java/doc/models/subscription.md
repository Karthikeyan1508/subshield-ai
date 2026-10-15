
# Subscription

## Structure

`Subscription`

## Fields

| Name | Type | Tags | Description | Getter | Setter |
|  --- | --- | --- | --- | --- | --- |
| `Id` | `String` | Required | - | String getId() | setId(String id) |
| `Merchant` | `String` | Required | - | String getMerchant() | setMerchant(String merchant) |
| `Status` | `String` | Required | PayPal status | String getStatus() | setStatus(String status) |
| `Price` | `Double` | Optional | - | Double getPrice() | setPrice(Double price) |
| `Currency` | `String` | Optional | - | String getCurrency() | setCurrency(String currency) |
| `Interval` | `String` | Optional | - | String getInterval() | setInterval(String interval) |
| `NextBillingTime` | `LocalDateTime` | Optional | Next charge, or the expected first charge while approval is pending | LocalDateTime getNextBillingTime() | setNextBillingTime(LocalDateTime nextBillingTime) |
| `TrialEndsAt` | `LocalDateTime` | Optional | - | LocalDateTime getTrialEndsAt() | setTrialEndsAt(LocalDateTime trialEndsAt) |
| `ApproveUrl` | `String` | Optional | Buyer approval link, only while APPROVAL_PENDING | String getApproveUrl() | setApproveUrl(String approveUrl) |
| `PriceHistory` | [`List<PriceHistory>`](../../doc/models/price-history.md) | Required | - | List<PriceHistory> getPriceHistory() | setPriceHistory(List<PriceHistory> priceHistory) |
| `Hike` | [`Hike`](../../doc/models/hike.md) | Required | - | Hike getHike() | setHike(Hike hike) |
| `PredatoryScore` | `int` | Required | **Constraints**: `>= 0`, `<= 100` | int getPredatoryScore() | setPredatoryScore(int predatoryScore) |

## Example

```java
import com.onrender.subshieldapi.DateTimeHelper;
import com.onrender.subshieldapi.models.Hike;
import com.onrender.subshieldapi.models.PriceHistory;
import com.onrender.subshieldapi.models.Subscription;
import java.util.Arrays;

Subscription subscription = new Subscription.Builder(
    "id4",
    "merchant0",
    "APPROVAL_PENDING",
    Arrays.asList(
        new PriceHistory.Builder(
            DateTimeHelper.fromRfc8601DateTime("2016-03-13T12:52:32.123Z"),
            125.56D
        )
        .build()
    ),
    new Hike.Builder(
        120.78D,
        100.18D,
        78
    )
    .build(),
    100
)
.price(131.92D)
.currency("USD")
.interval("1 MONTH")
.nextBillingTime(DateTimeHelper.fromRfc8601DateTime("2016-03-13T12:52:32.123Z"))
.trialEndsAt(DateTimeHelper.fromRfc8601DateTime("2016-03-13T12:52:32.123Z"))
.build();
```

