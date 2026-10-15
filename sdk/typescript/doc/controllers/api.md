# API

```ts
const apiController = new ApiController(client);
```

## Class Name

`ApiController`

## Methods

* [Get Health](../../doc/controllers/api.md#get-health)
* [List Subscriptions](../../doc/controllers/api.md#list-subscriptions)
* [Cancel Subscription](../../doc/controllers/api.md#cancel-subscription)
* [Run Alerts](../../doc/controllers/api.md#run-alerts)


# Get Health

```ts
async getHealth(
  requestOptions?: RequestOptions
): Promise<ApiResponse<HealthResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Service is up

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`HealthResponse`](../../doc/models/health-response.md).

## Example Usage

```ts
try {
  const response = await apiController.getHealth();

  // Extracting fully parsed response body.
  console.log(response.result);

  // Extracting response status code.
  console.log(response.statusCode);
  // Extracting response headers.
  console.log(response.headers);
  // Extracting response body of type `string | Stream`
  console.log(response.body);
} catch (error) {
  if (error instanceof ApiError) {
    // Extracting response error status code.
    console.log(error.statusCode);
    // Extracting response error headers.
    console.log(error.headers);
    // Extracting response error body of type `string | Stream`.
    console.log(error.body);
  }
}
```


# List Subscriptions

```ts
async listSubscriptions(
  requestOptions?: RequestOptions
): Promise<ApiResponse<Subscription[]>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Subscriptions

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`Subscription[]`](../../doc/models/subscription.md).

## Example Usage

```ts
try {
  const response = await apiController.listSubscriptions();

  // Extracting fully parsed response body.
  console.log(response.result);

  // Extracting response status code.
  console.log(response.statusCode);
  // Extracting response headers.
  console.log(response.headers);
  // Extracting response body of type `string | Stream`
  console.log(response.body);
} catch (error) {
  if (error instanceof ApiError) {
    // Extracting response error status code.
    console.log(error.statusCode);
    // Extracting response error headers.
    console.log(error.headers);
    // Extracting response error body of type `string | Stream`.
    console.log(error.body);
    if (error instanceof CustomError) {
      console.log(error.result);
    }
  }
}
```

## Errors

| HTTP Status Code | Error Description | Exception Class |
|  --- | --- | --- |
| 502 | PayPal or Zapier rejected the call | [`CustomError`](../../doc/models/custom-error.md) |


# Cancel Subscription

PayPal only cancels subscriptions the buyer has approved (ACTIVE or SUSPENDED).

```ts
async cancelSubscription(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiSubscriptionsCancelResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string` | Template, Required | PayPal subscription id, as returned by listSubscriptions |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Cancelled

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiSubscriptionsCancelResponse`](../../doc/models/api-subscriptions-cancel-response.md).

## Example Usage

```ts
const id = 'I-YSRDPHD11FLG';

try {
  const response = await apiController.cancelSubscription(id);

  // Extracting fully parsed response body.
  console.log(response.result);

  // Extracting response status code.
  console.log(response.statusCode);
  // Extracting response headers.
  console.log(response.headers);
  // Extracting response body of type `string | Stream`
  console.log(response.body);
} catch (error) {
  if (error instanceof ApiError) {
    // Extracting response error status code.
    console.log(error.statusCode);
    // Extracting response error headers.
    console.log(error.headers);
    // Extracting response error body of type `string | Stream`.
    console.log(error.body);
    if (error instanceof CustomError) {
      console.log(error.result);
    }
  }
}
```

## Errors

| HTTP Status Code | Error Description | Exception Class |
|  --- | --- | --- |
| 404 | Id is not in the ledger | [`CustomError`](../../doc/models/custom-error.md) |
| 502 | PayPal or Zapier rejected the call | [`CustomError`](../../doc/models/custom-error.md) |


# Run Alerts

Each subscription alerts once per price. Intended to be called by a cron job.

```ts
async runAlerts(
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiAlertsRunResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Ids that were alerted on this run

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiAlertsRunResponse`](../../doc/models/api-alerts-run-response.md).

## Example Usage

```ts
try {
  const response = await apiController.runAlerts();

  // Extracting fully parsed response body.
  console.log(response.result);

  // Extracting response status code.
  console.log(response.statusCode);
  // Extracting response headers.
  console.log(response.headers);
  // Extracting response body of type `string | Stream`
  console.log(response.body);
} catch (error) {
  if (error instanceof ApiError) {
    // Extracting response error status code.
    console.log(error.statusCode);
    // Extracting response error headers.
    console.log(error.headers);
    // Extracting response error body of type `string | Stream`.
    console.log(error.body);
    if (error instanceof CustomError) {
      console.log(error.result);
    }
  }
}
```

## Errors

| HTTP Status Code | Error Description | Exception Class |
|  --- | --- | --- |
| 502 | PayPal or Zapier rejected the call | [`CustomError`](../../doc/models/custom-error.md) |
| 503 | ZAPIER_WEBHOOK_URL is not configured | [`CustomError`](../../doc/models/custom-error.md) |

