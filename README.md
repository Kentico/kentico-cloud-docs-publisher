| [master](https://github.com/Kentico/kentico-cloud-docs-search/tree/master) | [develop](https://github.com/Kentico/kentico-cloud-docs-search/tree/develop) |
|:---:|:---:|
| [![Build Status](https://travis-ci.com/Kentico/kentico-cloud-docs-publisher.svg?branch=master)](https://travis-ci.com/Kentico/kentico-cloud-docs-publisher) [![codebeat badge](https://codebeat.co/badges/9f0fc490-0009-46ec-9e38-ad4a83442713)](https://codebeat.co/projects/github-com-kentico-kentico-cloud-docs-publisher-master) | [![Build Status](https://travis-ci.com/Kentico/kentico-cloud-docs-publisher.svg?branch=develop)](https://travis-ci.com/Kentico/kentico-cloud-docs-publisher) [![codebeat badge](https://codebeat.co/badges/c265105a-2af3-4b3d-b983-c6442b745652)](https://codebeat.co/projects/github-com-kentico-kentico-cloud-docs-publisher-develop) |

# Kentico Cloud Documentation - Publisher

Backend function for Kentico Cloud documentation portal, which utilizes [Kentico Cloud](https://app.kenticocloud.com/) as a source of its content.

The function periodically checks content item variants in Kentico Cloud that are in a `Cascade publish` or `Scheduled publish` worflow step. These content item variants and their inner items are then automatically published using [Content Management API](https://developer.kenticocloud.com/v1/reference#content-management-api-v2).

## Overview
1. This project is a TypeScript Azure Functions application.
2. It periodically checks content item variants in Kentico Cloud that are in specific workflow step and then publishes them. 

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
* `Teams.NotificationUrls` - Url for Teams notifications

## Testing
* Run `yarn run test` in the terminal.

## How To Contribute
Feel free to open a new issue where you describe your proposed changes, or even create a new pull request from your branch with proposed changes.

## Licence
All the source codes are published under MIT licence.
