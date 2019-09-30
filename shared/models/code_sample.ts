import { ContentItem, Elements } from 'kentico-cloud-delivery';

export class CodeSample extends ContentItem {
    public code: Elements.TextElement;
    public programmingLanguage: Elements.TaxonomyElement;
    public platform: Elements.TaxonomyElement;

    constructor() {
        super({
            propertyResolver: (fieldName: string) => {
                if (fieldName === 'programming_language') {
                    return 'programmingLanguage';
                }
                return fieldName;
            }
        });
    }
}
