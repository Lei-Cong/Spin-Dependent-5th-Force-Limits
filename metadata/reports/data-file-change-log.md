# Data file and version change log

This document records filename corrections and cases where a complete or
preferred dataset supersedes legacy files. Legacy files are retained unless a
rename is explicitly recorded.

| Date | Coupling | Previous file(s) | Current file | Action and reason |
| --- | --- | --- | --- | --- |
| 2026-07-23 | gVgV | `lepton-lepton/3Terrano_2015_m_abs_eN.csv` | `lepton-lepton/3Terrano_2015_m_abs_ee.csv` | Renamed. The result is an electron–electron constraint; `eN` was an incorrect fermion-pair suffix. |
| 2026-07-23 | gpgs | `lepton-nucleon/910Dzuba_2018_m_abs_eN.csv` | `lepton-nucleon/910Dzuba_2018_m_abs_Ne.csv` | Renamed to encode the ordered fermion pair consistently. The polarized nucleon precedes the unpolarized electron, so the viewer notation is `N-e`. The numerical data are unchanged. |
| 2026-07-23 | gpgp | `lepton-lepton/3Terrano_2015_m_abs_eN.csv` | `lepton-lepton/3Terrano_2015_m_abs_ee.csv` | Renamed. The result is an electron–electron constraint; `eN` was an incorrect suffix. The numerical data are unchanged. |
| 2026-07-23 | V1 | `V1_gsgs_data/Salumbides_2018_p_N.csv`; `V1_gsgs_data/Salumbides_2018_mu_N.csv` | `V1_gsgs_data/Salumbides_2014_p_N.csv`; `V1_gsgs_data/Salumbides_2014_mu_N.csv` | Renamed to match the 2014 Salumbides publication. The numerical data are unchanged. |
| 2026-07-23 | gsgs | `gs_squareV1bounds/V1_gse_EMM.csv` | `gs_squareV1bounds/V1_gse_EMM_new2026.csv` | The updated 2026 curve supersedes the legacy EMM curve in the viewer and is linked to `cong_testing_2026`. The legacy file remains on disk. |
| 2026-07-23 | gpgp | `3Cong_2025_m_ep_gpgp_90CL.csv`; `3Cong_2025_m_ep_gpgp_95CL.csv` | `3Cong_2025_m_ep_gpgp_95CL.csv` | Only the 95% CL curve is displayed. The 90% CL file remains on disk. |
| 2026-07-23 | gpgs | `nucleon-nucleon/neutron-nucleon/910Voronin_2018_m_abs_nN.csv` | `nucleon-nucleon/neutron-nucleon/910Voronin_2009_m_abs_nN.csv` | Renamed to match the source publication `voronin_neutron_2009`. The numerical data are unchanged. |
| 2026-07-23 | gpgs | `nucleon-nucleon/proton-nucleon/910Chaja_2024_abs_m_pN.csv` | `nucleon-nucleon/nucleon-nucleon/910Baruch_2024_abs_m_NN.csv` | Renamed and reclassified. Chaja is the first name of Chaja Baruch; the curve is treated as a distinct nucleon–nucleon (`N-N`) constraint. The numerical data are unchanged. |
| 2026-07-23 | gAgA | `45Haddock_2018a_m_abs_nN.csv`; `45Haddock_2018b_m_abs_nN copy.csv` | `45Haddock_2018c_m_abs_nN.csv` | The a/b files contain partial pieces. They remain on disk but are excluded from the viewer; the complete joined c dataset is used. |
| 2026-07-23 | gVgV | `45Haddock_2018a_m_abs_nN.csv`; `45Haddock_2018b_m_abs_nN copy.csv` | `45Haddock_2018c_m_abs_nN.csv` | The a/b files contain partial pieces. They remain on disk but are excluded from the viewer; the complete joined c dataset is used. |
| 2026-07-23 | gAgA | `2Vasilakis_2009_1_m_abs_ee.csv` | `3Vasilakis_2009_m_abs_nn.csv` | The unused `e-e` file is excluded. The `V3`, neutron–neutron dataset is used. |
| 2026-07-23 | gAgA | Cong 2025 V2, V3, and V2+V3 curves at 90% and 95% CL | `23Cong_2025_m_ep_gAgA_95CL.csv` | Only the combined `V2+V3` result at 95% CL is displayed. Other files remain on disk. |
| 2026-07-23 | gVgV | Cong 2025 V2+V3 curves at 90% and 95% CL | `23Cong_2025_m_ep_gVgV_95CL.csv` | Only the 95% CL result is displayed. The 90% CL file remains on disk. |

When a file is renamed, every viewer-manifest and metadata reference must be
updated in the same change. When a file is superseded rather than renamed, the
legacy file should remain available for audit unless a separate decision is
recorded here.
