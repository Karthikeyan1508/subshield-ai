# API

```python
client_controller = client.client
```

## Class Name

`APIController`

## Methods

* [Get Health](../../doc/controllers/api.md#get-health)
* [List Subscriptions](../../doc/controllers/api.md#list-subscriptions)
* [Cancel Subscription](../../doc/controllers/api.md#cancel-subscription)
* [Run Alerts](../../doc/controllers/api.md#run-alerts)


# Get Health

```python
def get_health(self)
```

## Response Type

**200**: Service is up

[`HealthResponse`](../../doc/models/health-response.md)

## Example Usage

```python
result = client_controller.get_health()
print(result)
```


# List Subscriptions

```python
def list_subscriptions(self)
```

## Response Type

**200**: Subscriptions

[`List[Subscription]`](../../doc/models/subscription.md)

## Example Usage

```python
result = client_controller.list_subscriptions()
print(result)
```

## Errors

| HTTP Status Code | Error Description | Exception Class |
|  --- | --- | --- |
| 502 | PayPal or Zapier rejected the call | [`ErrorException`](../../doc/models/error-exception.md) |


# Cancel Subscription

PayPal only cancels subscriptions the buyer has approved (ACTIVE or SUSPENDED).

```python
def cancel_subscription(self,
                       id)
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `str` | Template, Required | PayPal subscription id, as returned by listSubscriptions |

## Response Type

**200**: Cancelled

[`ApiSubscriptionsCancelResponse`](../../doc/models/api-subscriptions-cancel-response.md)

## Example Usage

```python
id = 'I-YSRDPHD11FLG'

result = client_controller.cancel_subscription(id)
print(result)
```

## Errors

| HTTP Status Code | Error Description | Exception Class |
|  --- | --- | --- |
| 404 | Id is not in the ledger | [`ErrorException`](../../doc/models/error-exception.md) |
| 502 | PayPal or Zapier rejected the call | [`ErrorException`](../../doc/models/error-exception.md) |


# Run Alerts

Each subscription alerts once per price. Intended to be called by a cron job.

```python
def run_alerts(self)
```

## Response Type

**200**: Ids that were alerted on this run

[`ApiAlertsRunResponse`](../../doc/models/api-alerts-run-response.md)

## Example Usage

```python
result = client_controller.run_alerts()
print(result)
```

## Errors

| HTTP Status Code | Error Description | Exception Class |
|  --- | --- | --- |
| 502 | PayPal or Zapier rejected the call | [`ErrorException`](../../doc/models/error-exception.md) |
| 503 | ZAPIER_WEBHOOK_URL is not configured | [`ErrorException`](../../doc/models/error-exception.md) |

