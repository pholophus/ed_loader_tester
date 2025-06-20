import { useSeismicLine } from '../renderer/Composables/useSeismicLine';
import { useSeismicSurveyLinePivot } from '../renderer/Composables/useSeismicSurveyLinePivot';
import { useSeismicData } from '../renderer/Composables/useSeismicData';
// Corrected imports based on search results
import { SeismicSurvey } from '../schemas/SeismicSurvey';
import { SeismicLine } from '../schemas/SeismicLine';
import mongoose from 'mongoose';

// Import the useSeismicSurvey composable
import { useSeismicSurvey } from '../renderer/Composables/useSeismicSurvey';

/**
 * Excludes specified keys from an object
 * @param obj The object to exclude keys from
 * @param keysToExclude Array of keys to exclude
 * @returns A new object without the excluded keys
 */
function excludeKeys<T extends object>(obj: T, keysToExclude: (keyof T)[]): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keysToExclude.includes(key as keyof T))
  ) as Partial<T>;
}

/**
 * Upserts a seismic survey and its associated seismic lines.
 * Links lines to the survey if they don't already exist.
 *
 * @param surveyName The name of the survey.
 * @param seismicLinesToUpsert An array of seismic line objects to upsert and link.
 * @returns Promise<boolean> - True if successful, false otherwise.
 */
export async function upsertSurveyAndLines(surveyName: string, seismicLinesToUpsert: SeismicLine[]): Promise<boolean> {
  try {
    const { createEmptySurvey, upsert: surveyUpsert } = useSeismicSurvey();
    const { insert: lineInsert, fetch: fetchLines, items: lineItems } = useSeismicLine();
    const { insert: surveyLineInsert, fetch: fetchSurveyLinePivots, items: surveyLinePivotItems } = useSeismicSurveyLinePivot();

    const surveyToUpsert = createEmptySurvey();
    surveyToUpsert.name = surveyName;

    const upsertedSurvey: SeismicSurvey | undefined = await surveyUpsert({ name: surveyName }, surveyToUpsert);

    // Check if surveyUpsert was successful and returned an ID
    if (!upsertedSurvey || !upsertedSurvey._id) {
      console.error("Service Error: Failed to upsert survey or get survey ID.");
      return false; // Indicate failure
    }

    for (const seismicLineToUpsert of seismicLinesToUpsert) {
      try {
        await fetchLines({ name: seismicLineToUpsert.name });

        // console.log('Line items:', lineItems.value);

        const existingLine = lineItems.value.find(line => line.name === seismicLineToUpsert.name);

        // console.log('Existing line:', existingLine);

        let lineIdToLink: mongoose.Types.ObjectId | undefined; // Use undefined for initial state

        if (existingLine && existingLine._id) {
          await fetchSurveyLinePivots({ surveyId: upsertedSurvey._id, lineId: existingLine._id });

          if (surveyLinePivotItems.value.length > 0) {
            continue;
          } else {
            lineIdToLink = existingLine._id;
          }

        } else {
          const insertedLine: SeismicLine | undefined = await lineInsert(seismicLineToUpsert);

          if (!insertedLine || !insertedLine._id) {
            continue;
          }
          lineIdToLink = insertedLine._id;
        }

        if (lineIdToLink) {
          await surveyLineInsert({
            surveyId: upsertedSurvey._id,
            lineId: lineIdToLink,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } catch (lineError) {

      }
    }

    return true; // Indicate success if we reached here

  } catch (error) {
    console.error("Service Error: An error occurred during survey and line upsert process:", error);
    return false; // Indicate failure
  }
}
