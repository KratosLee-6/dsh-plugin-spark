---
name: "uncertainty-ladder"
description: "Grade every finding in an evidence brief by how directly it is supported. / 按证据的直接程度为简报中的每个结论分级。"
display-name: "Uncertainty Ladder"
spark-relationship: novel_extension
---

# Uncertainty Ladder

> Unverified composition draft / 未验证的组合草案

## Relationship / 来源关系
- spark-relationship: novel_extension
- Extends one parent's steps; the other parent informed the goal as inspiration only. / 延伸一侧父级的步骤；另一侧仅作为灵感来源。
- Inspired by collision / 由碰撞触发: research-review-collision

## Inputs / 输入
- evidence-brief

## Outputs / 输出
- graded-evidence-brief

## Steps / 步骤
- Re-open each grouped finding and assign a grade: direct, inferred or assumed. / 重读每个分组结论并标注等级：直接、推断或假设。
- Re-cite the source of every finding whose grade changed during review. / 为复审中等级变化的结论重新引用来源。
- Flag conclusions that lost their supporting source after grading. / 标出分级后失去支撑来源的结论。

## Constraints / 约束
- Grades describe support strength, not truth. / 分级描述支撑强度，不代表真伪。
- Never upgrade an assumed finding without a new source. / 没有新来源时不得把假设升级。

## Tags / 标签
- research
- 研究
- uncertainty

## Parents / 来源
- research-synthesis
- accessibility-review
