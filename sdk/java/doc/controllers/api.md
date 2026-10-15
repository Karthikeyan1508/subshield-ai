# API

```java
APIController aPIController = client.getAPIController();
```

## Class Name

`APIController`

## Methods

* [Get Health](../../doc/controllers/api.md#get-health)
* [List Subscriptions](../../doc/controllers/api.md#list-subscriptions)
* [Cancel Subscription](../../doc/controllers/api.md#cancel-subscription)
* [Run Alerts](../../doc/controllers/api.md#run-alerts)


# Get Health

```java
CompletableFuture<HealthResponse> getHealthAsync()
```

## Response Type

**200**: Service is up

[`HealthResponse`](../../doc/models/health-response.md)

## Example Usage

```java
aPIController.getHealthAsync().thenAccept(result -> {
    // TODO success callback handler
    System.out.println(result);
}).exceptionally(exception -> {
    // TODO failure callback handler
    exception.printStackTrace();
    return null;
});
```


# List Subscriptions

```java
CompletableFuture<List<Subscription>> listSubscriptionsAsync()
```

## Response Type

**200**: Subscriptions

[`List<Subscription>`](../../doc/models/subscription.md)

## Example Usage

```java
aPIController.listSubscriptionsAsync().thenAccept(result -> {
    // TODO success callback handler
    System.out.println(result);
}).exceptionally(exception -> {
    Throwable cause = exception.getCause();

    if (cause instanceof ErrorException) {
        ErrorException errorException = (ErrorException) cause;
        errorException.printStackTrace();
    } else {
        // fallback for unexpected errors
        exception.printStackTrace();
    }

    return null;
});
```

## Errors

| HTTP Status Code | Error Description | Exception Class |
|  --- | --- | --- |
| 502 | PayPal or Zapier rejected the call | [`ErrorException`](../../doc/models/error-exception.md) |


# Cancel Subscription

PayPal only cancels subscriptions the buyer has approved (ACTIVE or SUSPENDED).

```java
CompletableFuture<ApiSubscriptionsCancelResponse> cancelSubscriptionAsync(
    final String id)
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `String` | Template, Required | PayPal subscription id, as returned by listSubscriptions |

## Response Type

**200**: Cancelled

[`ApiSubscriptionsCancelResponse`](../../doc/models/api-subscriptions-cancel-response.md)

## Example Usage

```java
String id = "I-YSRDPHD11FLG";

aPIController.cancelSubscriptionAsync(id).thenAccept(result -> {
    // TODO success callback handler
    System.out.println(result);
}).exceptionally(exception -> {
    Throwable cause = exception.getCause();

    if (cause instanceof ErrorException) {
        ErrorException errorException = (ErrorException) cause;
        errorException.printStackTrace();
    } else {
        // fallback for unexpected errors
        exception.printStackTrace();
    }

    return null;
});
```

## Errors

| HTTP Status Code | Error Description | Exception Class |
|  --- | --- | --- |
| 404 | Id is not in the ledger | [`ErrorException`](../../doc/models/error-exception.md) |
| 502 | PayPal or Zapier rejected the call | [`ErrorException`](../../doc/models/error-exception.md) |


# Run Alerts

Each subscription alerts once per price. Intended to be called by a cron job.

```java
CompletableFuture<ApiAlertsRunResponse> runAlertsAsync()
```

## Response Type

**200**: Ids that were alerted on this run

[`ApiAlertsRunResponse`](../../doc/models/api-alerts-run-response.md)

## Example Usage

```java
aPIController.runAlertsAsync().thenAccept(result -> {
    // TODO success callback handler
    System.out.println(result);
}).exceptionally(exception -> {
    Throwable cause = exception.getCause();

    if (cause instanceof ErrorException) {
        ErrorException errorException = (ErrorException) cause;
        errorException.printStackTrace();
    } else {
        // fallback for unexpected errors
        exception.printStackTrace();
    }

    return null;
});
```

## Errors

| HTTP Status Code | Error Description | Exception Class |
|  --- | --- | --- |
| 502 | PayPal or Zapier rejected the call | [`ErrorException`](../../doc/models/error-exception.md) |
| 503 | ZAPIER_WEBHOOK_URL is not configured | [`ErrorException`](../../doc/models/error-exception.md) |

