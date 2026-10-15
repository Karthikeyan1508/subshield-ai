
# Api Subscriptions Cancel Response

## Structure

`ApiSubscriptionsCancelResponse`

## Fields

| Name | Type | Tags | Description | Getter | Setter |
|  --- | --- | --- | --- | --- | --- |
| `Ok` | `boolean` | Required | - | boolean getOk() | setOk(boolean ok) |

## Example

```java
import localhost4000.models.ApiSubscriptionsCancelResponse;

ApiSubscriptionsCancelResponse apiSubscriptionsCancelResponse = new ApiSubscriptionsCancelResponse.Builder(
    false
)
.build();
```

