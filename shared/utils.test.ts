import { ContentItem } from 'kentico-cloud-delivery';
import { getLinkedItemsCodenames } from './utils';

describe('getLinkedItemsCodenames', () => {
  it('should return codenames of linked items and ignore components in richtexts', () => {
    const response: ContentItem = {
      elements: {
        rt: {
          name: 'RT',
          type: 'rich_text',
          value: '<object ' +
            'type="application/kenticocloud" ' +
            'data-type="item" ' +
            'data-rel="link" ' +
            'data-codename="item_w_empty_required_field">' +
            '</object>\n' +
            '<object ' +
            'type="application/kenticocloud" ' +
            'data-type="item" ' +
            'data-rel="component" ' +
            'data-codename="n270aa43a_0910_0193_cac2_00a2dc564224">' +
            '</object>\n' +
            '<object ' +
            'type="application/kenticocloud" ' +
            'data-type="item" ' +
            'data-rel="link" ' +
            'data-codename="android_new_knowledge_android">' +
            '</object>\n' +
            '<p><br></p>' +
            '<object ' +
            'type="application/kenticocloud" ' +
            'data-type="item" ' +
            'data-rel="link" ' +
            'data-codename="new_article_php">' +
            '</object>',
        },
      },
      system: {
        codename: 'automatically_published',
        id: '51103ce0-a4f6-40f9-99f9-c6a99c8207ee',
        language: 'default',
        lastModified: new Date(),
        name: 'Automatically published',
        sitemapLocations: [],
        type: 'automat_2',
      },
    };
    const expectedCodenames = [
      'item_w_empty_required_field',
      'android_new_knowledge_android',
      'new_article_php',
    ];

    const result = getLinkedItemsCodenames(response);

    expect(result.sort()).toEqual(expectedCodenames.sort());
  });
});
