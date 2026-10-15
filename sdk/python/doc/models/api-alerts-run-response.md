
# Api Alerts Run Response

## Structure

`ApiAlertsRunResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `sent` | `List[str]` | Required | - |

## Example

```python
from subshieldaiapi.models.api_alerts_run_response import ApiAlertsRunResponse

api_alerts_run_response = ApiAlertsRunResponse(
    sent=[
        'sent2',
        'sent3'
    ]
)
```

