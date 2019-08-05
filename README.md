| [master](https://github.com/Kentico/kentico-cloud-docs-search/tree/master) | [develop](https://github.com/Kentico/kentico-cloud-docs-search/tree/develop) |
|:---:|:---:|
| [![Build Status](https://travis-ci.com/KenticoDocs/cloud-docs-publisher.svg?branch=master)](https://travis-ci.com/KenticoDocs/cloud-docs-publisher) [![codebeat badge](https://codebeat.co/badges/ad12c4ef-caec-4f17-900e-9641efa33ccb)](https://codebeat.co/projects/github-com-kenticodocs-cloud-docs-publisher-master) | [![Build Status](https://travis-ci.com/KenticoDocs/cloud-docs-dispatcher.svg?branch=develop)](https://travis-ci.com/KenticoDocs/cloud-docs-dispatcher) [![codebeat badge](https://codebeat.co/badges/ed1f8296-9732-4085-ae84-7a36b405b3cd)](https://codebeat.co/projects/github-com-kenticodocs-cloud-docs-publisher-develop) |

# Kentico Cloud Documentation - Publisher

Backend function for Kentico Cloud documentation portal, which utilizes [Kentico Cloud](https://app.kenticocloud.com/) as a source of its content.

The function receives events from [Dispatcher](https://github.com/KenticoDocs/cloud-docs-web/wiki/Dispatcher) with the webhook data from Kentico Cloud containing workflow changes. This service then retrieves the item's whose workflow step was changed, checks the workflow step it was changed to and performs a `Cascade publish` or cascade `Scheduled publish` worflow step. The content item variant and its inner items are published/scheduled using [Content Management API](https://developer.kenticocloud.com/v1/reference#content-management-api-v2).

## Overview

1. This project is a TypeScript Azure Functions application.
2. It reacts to events from Dispatcher containing item and workflow step id from Kentico Cloud and performs cascade publish or schedule on all of the item's inner items.

## Setup

### Prerequisites

1. Node (+yarn) installed
2. Visual Studio Code installed
3. Subscriptions on Kentico Cloud

### Instructions
1. Open Visual Studio Code and install the prerequisites according to the [following steps](https://code.visualstudio.com/tutorials/functions-extension/getting-started).
2. Log in to Azure using the Azure Functions extension tab.
3. Clone the project repository and open it in Visual Studio Code.
4. Run `yarn install` in the terminal.
5. Set the required keys.
6. Deploy to Azure using Azure Functions extension tab, or run locally by pressing `Ctrl + F5` in Visual Studio Code.

#### Required Keys
* `KC.ProjectId` - Kentico Cloud project ID
* `KC.ContentManagementApiKey` - Kentico Cloud Content Management API key
* `KC.PreviewApiKey` - Kentico Cloud Delivery Preview API key
* `KC.InternalApiToken` - Kentico Cloud Authorization token
* `KC.Step.ArchivedId` - Id of Archived workflow step
* `KC.Step.CascadePublishId` - Id of Cascade publish workflow step
* `KC.Step.PublishId` - Id of Publish workflow step
* `KC.Step.ScheduledPublishId` - Id of Scheduled Publish workflow step
* `EventGrid.Notification.Key` - Key for notification eventGrid topic
* `EventGrid.Notification.Endpoint` - Url for notification eventGrid topic

## Testing
* Run `yarn run test` in the terminal.

## How To Contribute
Feel free to open a new issue where you describe your proposed changes, or even create a new pull request from your branch with proposed changes.

## Licence
All the source codes are published under MIT licence.
