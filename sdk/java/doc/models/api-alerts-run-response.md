
# Api Alerts Run Response

## Structure

`ApiAlertsRunResponse`

## Fields

| Name | Type | Tags | Description | Getter | Setter |
|  --- | --- | --- | --- | --- | --- |
| `Sent` | `List<String>` | Required | - | List<String> getSent() | setSent(List<String> sent) |

## Example

```java
import java.util.Arrays;
import localhost4000.models.ApiAlertsRunResponse;

ApiAlertsRunResponse apiAlertsRunResponse = new ApiAlertsRunResponse.Builder(
    Arrays.asList(
        "sent0",
        "sent1",
        "sent2"
    )
)
.build();
```

