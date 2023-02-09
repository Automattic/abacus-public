import { getUnitInfo, UnitDerivationType, UnitType } from './metrics'
import { Metric, MetricParameterType, PipeModels, PipeValueFields } from './schemas'

describe('lib/metrics.ts module', () => {
  describe('getUnitInfo', () => {
    it('works as expected', () => {
      // We are effectively double coding these and could possibly switch these
      // to inline snapshots in the future.
      expect(
        getUnitInfo({
          parameterType: MetricParameterType.Conversion,
        } as Metric),
      ).toEqual({ unitType: UnitType.Ratio })

      expect(
        getUnitInfo(
          {
            parameterType: MetricParameterType.Conversion,
          } as Metric,
          [UnitDerivationType.AbsoluteDifference],
        ),
      ).toEqual({ unitType: UnitType.RatioPoints })

      expect(
        getUnitInfo(
          {
            parameterType: MetricParameterType.Conversion,
          } as Metric,
          [UnitDerivationType.ImpactScaled],
        ),
      ).toEqual({ unitType: UnitType.Count })

      expect(
        getUnitInfo(
          {
            parameterType: MetricParameterType.Conversion,
          } as Metric,
          [UnitDerivationType.AbsoluteDifference, UnitDerivationType.ImpactScaled],
        ),
      ).toEqual({ unitType: UnitType.Count })

      expect(
        getUnitInfo(
          {
            parameterType: MetricParameterType.Conversion,
          } as Metric,
          [UnitDerivationType.RelativeDifference],
        ),
      ).toEqual({ unitType: UnitType.Ratio })

      expect(
        getUnitInfo({
          parameterType: MetricParameterType.Pipe,
          pipeParams: { model: PipeModels.ChurnUntimed, valueField: PipeValueFields.Prediction },
        } as unknown as Metric),
      ).toEqual({ unitType: UnitType.Ratio })

      expect(
        getUnitInfo(
          {
            parameterType: MetricParameterType.Pipe,
            pipeParams: { model: PipeModels.ChurnUntimed, valueField: PipeValueFields.Prediction },
          } as unknown as Metric,
          [UnitDerivationType.AbsoluteDifference],
        ),
      ).toEqual({ unitType: UnitType.RatioPoints })

      expect(
        getUnitInfo(
          {
            parameterType: MetricParameterType.Pipe,
            pipeParams: { model: PipeModels.ChurnUntimed, valueField: PipeValueFields.Prediction },
          } as unknown as Metric,
          [UnitDerivationType.ImpactScaled],
        ),
      ).toEqual({ unitType: UnitType.Count })

      expect(
        getUnitInfo(
          {
            parameterType: MetricParameterType.Pipe,
            pipeParams: { model: PipeModels.ChurnUntimed, valueField: PipeValueFields.Prediction },
          } as unknown as Metric,
          [UnitDerivationType.AbsoluteDifference, UnitDerivationType.ImpactScaled],
        ),
      ).toEqual({ unitType: UnitType.Count })

      expect(
        getUnitInfo({
          parameterType: MetricParameterType.Revenue,
        } as Metric),
      ).toEqual({ unitType: UnitType.Usd })

      expect(
        getUnitInfo(
          {
            parameterType: MetricParameterType.Revenue,
          } as Metric,
          [UnitDerivationType.AbsoluteDifference],
        ),
      ).toEqual({ unitType: UnitType.Usd })

      expect(
        getUnitInfo(
          {
            parameterType: MetricParameterType.Revenue,
          } as Metric,
          [UnitDerivationType.ImpactScaled],
        ),
      ).toEqual({ unitType: UnitType.Usd })

      expect(
        getUnitInfo(
          {
            parameterType: MetricParameterType.Revenue,
          } as Metric,
          [UnitDerivationType.AbsoluteDifference, UnitDerivationType.ImpactScaled],
        ),
      ).toEqual({ unitType: UnitType.Usd })

      expect(
        getUnitInfo(
          {
            parameterType: MetricParameterType.Revenue,
          } as Metric,
          [UnitDerivationType.RelativeDifference],
        ),
      ).toEqual({ unitType: UnitType.Ratio })
    })

    it('throws for unknown metric', () => {
      expect(() =>
        getUnitInfo({
          parameterType: 'unknown metric type',
        } as unknown as Metric),
      ).toThrowErrorMatchingInlineSnapshot(`"Could not find matching unit-type for metric and derivations."`)
    })
  })
})
