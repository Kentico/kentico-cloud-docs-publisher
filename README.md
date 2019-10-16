| [master](https://github.com/KenticoDocs/kontent-docs-publisher/tree/master) | [develop](https://github.com/KenticoDocs/kontent-docs-publisher/tree/develop) |
|:---:|:---:|
| [![Build Status](https://travis-ci.com/KenticoDocs/kontent-docs-publisher.svg?branch=master)](https://travis-ci.com/KenticoDocs/kontent-docs-publisher) | [![Build Status](https://travis-ci.com/KenticoDocs/kontent-docs-publisher.svg?branch=develop)](https://travis-ci.com/KenticoDocs/kontent-docs-publisher) |

# Kentico Kontent Documentation - Publisher

Backend function for Kentico Kontent documentation portal, which utilizes [Kentico Kontent](https://app.kontent.ai/) as a source of its data.

The function periodically checks content item variants in Kentico Kontent that are in a `Cascade publish` or `Scheduled publish` worflow step. These content item variants and their inner items are then automatically published using [Content Management API](https://docs.kontent.ai/reference/content-management-api-v2).

## Overview
1. This project is a TypeScript Azure Functions application.
2. It periodically checks content item variants in Kentico Kontent that are in specific workflow step and then publishes them. 

## Setup

### Prerequisites
1. Node (+yarn) installed
2. Visual Studio Code installed
3. Subscriptions on Kentico Kontent

### Instructions
1. Open Visual Studio Code and install the prerequisites according to the [following steps](https://code.visualstudio.com/tutorials/functions-extension/getting-started).
2. Log in to Azure using the Azure Functions extension tab.
3. Clone the project repository and open it in Visual Studio Code.
4. Run `yarn install` in the terminal.
5. Set the required keys.
6. Deploy to Azure using Azure Functions extension tab, or run locally by pressing `Ctrl + F5` in Visual Studio Code.

#### Required Keys
* `KC.ProjectId` - Kentico Kontent project ID
* `KC.ContentManagementApiKey` - Kentico Kontent Content Management API key
* `KC.PreviewApiKey` - Kentico Kontent Delivery Preview API key
* `KC.InternalApiToken` - Kentico Kontent Authorization token
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
