// TODO 手机端识图预留桩，现阶段不实现真实逻辑，不引入任何 OCR 依赖。
// 识图/PDF 解析仅由开发端 tools/pdf_pipeline 流水线完成，产出结构化题目 JSON 后由 APP 导入。

/**
 * 识别题目图片（未来对接 MinerU 云端 API）
 * @param imageBlob 题目图片
 */
export async function recognizeQuestionImage(_imageBlob: Blob): Promise<unknown> {
  throw new Error('识图功能尚未实现，仅开发端 tools/pdf_pipeline 流水线可用')
}

/**
 * PDF 解析识别（手机端预留）
 * @param file PDF 文件
 */
export async function parsePdfByMineru(_file: File): Promise<unknown> {
  throw new Error('PDF 解析功能尚未实现，仅开发端 tools/pdf_pipeline 流水线可用')
}
