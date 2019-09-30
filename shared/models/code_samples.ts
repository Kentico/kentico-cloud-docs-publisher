import { ContentItem, Elements } from 'kentico-cloud-delivery';
import { CodeSample } from './code_sample';

export class CodeSamples extends ContentItem {
    public codeSamples: Elements.LinkedItemsElement<CodeSample>;

    constructor() {
        super({
            propertyResolver: (fieldName: string) => {
                if (fieldName === 'code_samples') {
                    return 'codeSamples';
                }
                return fieldName;
            }
        });
    }
}
