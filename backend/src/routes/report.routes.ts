import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { uploadMedicalReport } from '../middleware/reportUpload.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../constants/roles';

const router = Router();

// Public & Patient Streaming Route for live preview
router.get('/view/:id', ReportController.streamReportPdf);
router.get('/patient-reports', ReportController.getByVerifiedPhone);

router.post('/publish', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_TECHNICIAN), uploadMedicalReport.single('reportPdf'), ReportController.uploadAndPublish);
router.get('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_TECHNICIAN, ROLES.DOCTOR), ReportController.getAll);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), ReportController.delete);

export default router;